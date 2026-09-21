import { supabaseAdmin } from "@/lib/supabase/admin";

export interface ReferrerInfo {
  id: string;
  name: string;
  email: string;
  code: string;
}

/**
 * Deterministically generates a memorable, branded referral code for a user
 * Format: TSLA-[FIRST_NAME_OR_HANDLE]-[SHORT_ID] (e.g. TSLA-DIVINE-4045, TSLA-HUSSEIN-1027)
 */
export function generateReferralCode(user: { id: string; email?: string | null; full_name?: string | null }): string {
  const rawName = user.full_name || user.email?.split("@")[0] || "VIP";
  const cleanName = rawName.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 8);
  const shortId = user.id.replace(/-/g, "").slice(0, 4).toUpperCase();
  return `TSLA-${cleanName || "VIP"}-${shortId}`;
}

/**
 * Resolves a referral code to a referrer user profile
 */
export async function resolveReferrer(code: string): Promise<ReferrerInfo | null> {
  if (!code) return null;
  const cleanCode = code.trim().toUpperCase();

  try {
    // 1. Fetch all profiles from Supabase
    const { data: profiles, error } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, email");

    if (error || !profiles) {
      console.error("[Referral] Error fetching profiles to resolve code:", error);
      return null;
    }

    // 2. Check each profile's deterministic code
    for (const p of profiles) {
      const generatedCode = generateReferralCode(p);
      if (generatedCode === cleanCode) {
        return {
          id: p.id,
          name: p.full_name || p.email?.split("@")[0] || "TSLA Member",
          email: p.email || "",
          code: generatedCode,
        };
      }
    }

    // 3. Check auth users metadata in case of custom codes
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
    if (authUsers?.users) {
      for (const u of authUsers.users) {
        const metaCode = u.user_metadata?.referral_code?.trim()?.toUpperCase();
        if (metaCode === cleanCode) {
          const profile = profiles.find((p) => p.id === u.id);
          return {
            id: u.id,
            name: profile?.full_name || u.user_metadata?.full_name || u.email?.split("@")[0] || "TSLA Member",
            email: u.email || "",
            code: metaCode,
          };
        }
      }
    }

    return null;
  } catch (err) {
    console.error("[Referral] Unexpected error resolving code:", err);
    return null;
  }
}

/**
 * Awards 5% referral commission to the inviter whenever a referee funds their wallet
 */
export async function awardReferralCommission({
  refereeUserId,
  depositAmount,
  depositReference,
}: {
  refereeUserId: string;
  depositAmount: number;
  depositReference: string;
}) {
  try {
    if (!refereeUserId || !depositAmount || depositAmount <= 0) {
      return { success: false, reason: "invalid_inputs" };
    }

    // 1. Fetch referee user metadata to find who referred them
    const { data: refereeAuth, error: authErr } = await supabaseAdmin.auth.admin.getUserById(refereeUserId);
    if (authErr || !refereeAuth?.user) {
      console.warn("[Referral] Could not find referee user:", refereeUserId);
      return { success: false, reason: "referee_not_found" };
    }

    const referrerUserId = refereeAuth.user.user_metadata?.referred_by_user_id;
    if (!referrerUserId || referrerUserId === refereeUserId) {
      // User was not referred or self-referral
      return { success: false, reason: "no_referrer" };
    }

    // 2. Prevent duplicate commission on same deposit transaction
    const commissionRef = `REF-COMM-${depositReference.slice(0, 30)}`;
    const { data: existingTx } = await supabaseAdmin
      .from("transactions")
      .select("id")
      .eq("reference", commissionRef)
      .single();

    if (existingTx) {
      console.log("[Referral] Commission already awarded for reference:", commissionRef);
      return { success: true, alreadyAwarded: true };
    }

    // 3. Compute 5% commission
    const commissionAmount = Math.round(depositAmount * 0.05);
    if (commissionAmount <= 0) {
      return { success: false, reason: "zero_commission" };
    }

    // 4. Fetch referrer wallet
    const { data: referrerWallet, error: wErr } = await supabaseAdmin
      .from("wallets")
      .select("id, balance")
      .eq("user_id", referrerUserId)
      .single();

    if (wErr || !referrerWallet) {
      console.warn("[Referral] Referrer wallet not found:", referrerUserId);
      return { success: false, reason: "referrer_wallet_not_found" };
    }

    const currentBalance = Number(referrerWallet.balance || 0);
    const newBalance = Number((currentBalance + commissionAmount).toFixed(2));

    // 5. Credit referrer wallet
    const { error: updateErr } = await supabaseAdmin
      .from("wallets")
      .update({
        balance: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq("id", referrerWallet.id);

    if (updateErr) {
      console.error("[Referral] Failed to credit wallet:", updateErr);
      return { success: false, error: updateErr.message };
    }

    // 6. Fetch referee friendly name
    const { data: refereeProfile } = await supabaseAdmin
      .from("profiles")
      .select("full_name, email")
      .eq("id", refereeUserId)
      .single();

    const refereeName = refereeProfile?.full_name || refereeAuth.user.email?.split("@")[0] || "Friend";

    // 7. Insert bonus transaction into transactions ledger
    await supabaseAdmin.from("transactions").insert({
      user_id: referrerUserId,
      amount: commissionAmount,
      type: "bonus",
      status: "completed",
      reference: commissionRef,
      description: `5% Referral Commission from ${refereeName}'s deposit (₦${depositAmount.toLocaleString()})`,
      metadata: {
        category: "referral_commission",
        rate_percent: 5,
        deposit_amount: depositAmount,
        deposit_reference: depositReference,
        referee_id: refereeUserId,
        referee_name: refereeName,
        credited_at: new Date().toISOString(),
      },
    });

    console.log(`[Referral] Credited ₦${commissionAmount} (5%) to referrer ${referrerUserId} for deposit of ₦${depositAmount}`);
    return { success: true, commissionAmount, referrerUserId, newBalance };
  } catch (err: any) {
    console.error("[Referral] Unexpected error awarding commission:", err);
    return { success: false, error: err.message };
  }
}
