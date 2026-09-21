import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { generateReferralCode } from "@/lib/referrals";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID required" }, { status: 400 });
    }

    // 1. Fetch user profile
    const { data: profile, error: pErr } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, email, created_at")
      .eq("id", userId)
      .single();

    if (pErr || !profile) {
      return NextResponse.json({ success: false, error: "User profile not found" }, { status: 404 });
    }

    // 2. Generate referral code
    const referralCode = generateReferralCode(profile);

    // 3. Find all users referred by this user
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
    const referredUsers: Array<{
      id: string;
      name: string;
      email: string;
      joinedAt: string;
    }> = [];

    if (authUsers?.users) {
      for (const u of authUsers.users) {
        if (u.user_metadata?.referred_by_user_id === userId) {
          const rawEmail = u.email || "";
          const parts = rawEmail.split("@");
          const maskedEmail = parts.length === 2
            ? `${parts[0].slice(0, 3)}***@${parts[1]}`
            : "User";

          referredUsers.push({
            id: u.id,
            name: u.user_metadata?.full_name || "Friend",
            email: maskedEmail,
            joinedAt: u.created_at,
          });
        }
      }
    }

    // 4. Fetch all referral bonus transactions for this user
    const { data: txns } = await supabaseAdmin
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .eq("type", "bonus")
      .order("created_at", { ascending: false });

    const referralCommissions = (txns || []).filter(
      (t: any) => t.metadata?.category === "referral_commission" || t.description?.includes("Referral Commission")
    );

    const totalEarnedNgn = referralCommissions.reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);

    return NextResponse.json({
      success: true,
      code: referralCode,
      ratePercent: 5,
      stats: {
        totalReferred: referredUsers.length,
        totalEarnedNgn,
        commissionCount: referralCommissions.length,
      },
      referredFriends: referredUsers,
      recentCommissions: referralCommissions.slice(0, 15).map((c: any) => ({
        id: c.id,
        amount: Number(c.amount || 0),
        description: c.description,
        refereeName: c.metadata?.referee_name || "Friend",
        depositAmount: c.metadata?.deposit_amount || 0,
        date: c.created_at,
        reference: c.reference,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
