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

    // 2. Fetch Orders
    let totalOrders = 0;
    let pendingOrders = 0;
    let recentOrders: any[] = [];

    const { data: orders, error: oErr } = await supabaseAdmin
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (!oErr && orders) {
      totalOrders = orders.length;
      pendingOrders = orders.filter((o) => o.status === "pending").length;
      recentOrders = orders;
    }

    // 3. Fetch Transactions
    let totalRevenue = 0;
    let recentTransactions: any[] = [];

    const { data: txns, error: tErr } = await supabaseAdmin
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (!tErr && txns) {
      recentTransactions = txns;
      totalRevenue = txns
        .filter((t) => t.status === "successful" && Number(t.amount) > 0)
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    }

    // 4. Recent joined users
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
