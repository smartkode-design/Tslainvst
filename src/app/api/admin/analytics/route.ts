import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Fetch real profiles
    const { data: profiles, error: pErr } = await supabaseAdmin
      .from("profiles")
      .select("id, role, created_at");

    const totalUsers = profiles?.length || 0;
    const sellersCount = profiles?.filter((p) => p.role === "seller").length || 0;
    const adminsCount = profiles?.filter((p) => p.role === "admin").length || 0;
    const standardUsers = totalUsers - sellersCount - adminsCount;

    // 2. Fetch real wallets
    const { data: wallets, error: wErr } = await supabaseAdmin
      .from("wallets")
      .select("balance");

    const totalFloat = (wallets || []).reduce((sum, w) => sum + Number(w.balance || 0), 0);

    // 3. Fetch real transactions
    const { data: txns, error: tErr } = await supabaseAdmin
      .from("transactions")
      .select("amount, type, status, created_at");

    const totalDeposits = (txns || [])
      .filter((t) => t.type === "deposit" && t.status === "completed")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const totalPurchases = (txns || [])
      .filter((t) => t.type === "purchase" && t.status === "completed")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    // 4. Fetch real orders (excluding system pricing config order)
    const { data: orders, error: oErr } = await supabaseAdmin
      .from("orders")
      .select("service_type, amount_ngn, status, created_at")
      .neq("provider_order_id", "SYSTEM_PRICING_CONFIG");

    const totalOrders = orders?.length || 0;
    const completedOrders = orders?.filter((o) => o.status === "completed").length || 0;

    const ordersByType = {
      sms: orders?.filter((o) => o.service_type === "sms").length || 0,
      smm: orders?.filter((o) => o.service_type === "smm").length || 0,
      log: orders?.filter((o) => o.service_type === "log").length || 0,
    };

    return NextResponse.json({
      success: true,
      analytics: {
        users: {
          total: totalUsers,
          sellers: sellersCount,
          admins: adminsCount || 1,
          standard: standardUsers,
        },
        financials: {
          totalFloat,
          totalDeposits,
          totalPurchases,
        },
        orders: {
          total: totalOrders,
          completed: completedOrders,
          byType: ordersByType,
        },
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
