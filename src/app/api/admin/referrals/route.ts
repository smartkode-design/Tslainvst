import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { generateReferralCode } from "@/lib/referrals";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Fetch all profiles
    const { data: profiles, error: pErr } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, email, role, created_at");

    if (pErr) throw pErr;

    // 2. Fetch all bonus transactions representing referral commissions
    const { data: bonusTxns, error: tErr } = await supabaseAdmin
      .from("transactions")
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          email
        )
      `)
      .eq("type", "bonus")
      .order("created_at", { ascending: false });

    if (tErr) throw tErr;

    const referralTxns = (bonusTxns || []).filter(
      (t: any) => t.metadata?.category === "referral_commission" || t.description?.includes("Referral Commission")
    );

    const totalCommissionsPaidNgn = referralTxns.reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);

    // 3. Fetch auth users to see referral connections
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
    const referrerCounts = new Map<string, number>();

    if (authUsers?.users) {
      for (const u of authUsers.users) {
        const refId = u.user_metadata?.referred_by_user_id;
        if (refId) {
          referrerCounts.set(refId, (referrerCounts.get(refId) || 0) + 1);
        }
      }
    }

    // 4. Build leaderboard of top referrers
    const leaderboard = (profiles || [])
      .map((p) => {
        const invitedCount = referrerCounts.get(p.id) || 0;
        const userEarnings = referralTxns
          .filter((t: any) => t.user_id === p.id)
          .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);

        return {
          id: p.id,
          name: p.full_name || p.email?.split("@")[0] || "User",
          email: p.email,
          code: generateReferralCode(p),
          invitedCount,
          totalEarnedNgn: userEarnings,
        };
      })
      .filter((u) => u.invitedCount > 0 || u.totalEarnedNgn > 0)
      .sort((a, b) => b.totalEarnedNgn - a.totalEarnedNgn || b.invitedCount - a.invitedCount);

    return NextResponse.json({
      success: true,
      stats: {
        totalCommissionsPaidNgn,
        totalCommissionsCount: referralTxns.length,
        totalAffiliatesCount: leaderboard.length,
        activeRatePercent: 5,
      },
      leaderboard,
      recentCommissions: referralTxns.slice(0, 30).map((t: any) => ({
        id: t.id,
        referrerName: t.profiles?.full_name || t.profiles?.email?.split("@")[0] || "Referrer",
        referrerEmail: t.profiles?.email || "—",
        refereeName: t.metadata?.referee_name || "Friend",
        amountNgn: Number(t.amount || 0),
        depositAmountNgn: Number(t.metadata?.deposit_amount || 0),
        reference: t.reference,
        date: t.created_at,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
