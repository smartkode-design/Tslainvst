import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Fetch Users
    const { data: profiles, error: pErr } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, email, role, created_at")
      .order("created_at", { ascending: false });

    if (pErr) throw pErr;

    const totalUsers = profiles?.length || 0;
    const activeSellers = profiles?.filter((p) => p.role === "seller").length || 0;

    // 2. Fetch All Deposits (Total Money Collected & Today's Collection)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data: allDeposits } = await supabaseAdmin
      .from("transactions")
      .select("amount, created_at, status")
      .eq("type", "deposit")
      .in("status", ["completed", "successful"]);

    const totalDeposited = (allDeposits || []).reduce((sum, d) => sum + Number(d.amount || 0), 0);
    const todayDeposited = (allDeposits || [])
      .filter((d) => new Date(d.created_at) >= todayStart)
      .reduce((sum, d) => sum + Number(d.amount || 0), 0);

    // 3. Fetch All Wallets (Total Customer Float Liability)
    const { data: allWallets } = await supabaseAdmin
      .from("wallets")
      .select("balance");

    const totalFloat = (allWallets || []).reduce((sum, w) => sum + Number(w.balance || 0), 0);

    // 4. Fetch Orders
    let totalOrders = 0;
    let pendingOrders = 0;
    let recentOrders: any[] = [];
    let totalRevenue = 0;

    const [{ data: allOrders }, { data: recentOrdersData }] = await Promise.all([
      supabaseAdmin.from("orders").select("id, status, amount_ngn"),
      supabaseAdmin.from("orders").select("*").order("created_at", { ascending: false }).limit(10),
    ]);

    if (allOrders) {
      totalOrders = allOrders.length;
      pendingOrders = allOrders.filter((o) => o.status === "pending" || o.status === "processing").length;
      totalRevenue = allOrders
        .filter((o) => o.status === "completed" || o.status === "processing")
        .reduce((sum, o) => sum + Number(o.amount_ngn || 0), 0);
    }
    if (recentOrdersData) {
      recentOrders = recentOrdersData;
    }

    // 5. Recent Transactions
    let recentTransactions: any[] = [];
    const { data: txns } = await supabaseAdmin
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (txns) {
      recentTransactions = txns;
    }

    // 6. Recent joined users
    const recentUsers = (profiles || []).slice(0, 5).map((u) => ({
      id: u.id,
      name: u.full_name || u.email?.split("@")[0] || "User",
      email: u.email,
      role: u.role,
      joined: new Date(u.created_at).toLocaleDateString("en-NG", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    }));

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        activeSellers,
        totalDeposited,
        todayDeposited,
        totalFloat,
        totalRevenue,
        totalOrders,
        pendingOrders,
      },
      recentUsers,
      recentOrders,
      recentTransactions,
    });
  } catch (error: any) {
    console.error("Admin stats fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stats: {
          totalUsers: 0,
          activeSellers: 0,
          totalRevenue: 0,
          totalOrders: 0,
          pendingOrders: 0,
        },
        recentUsers: [],
        recentOrders: [],
        recentTransactions: [],
      },
      { status: 500 }
    );
  }
}
