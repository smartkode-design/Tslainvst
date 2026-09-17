import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export interface AdminTransactionItem {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  type: "deposit" | "purchase" | "refund" | "bonus" | "withdrawal";
  status: "completed" | "pending" | "failed";
  reference: string;
  description: string;
  metadata: any;
  createdAt: string;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const typeFilter = searchParams.get("type");

    let query = supabaseAdmin
      .from("transactions")
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          email
        )
      `)
      .order("created_at", { ascending: false });

    if (typeFilter && typeFilter !== "all") {
      query = query.eq("type", typeFilter);
    }

    const { data: dbTxns, error } = await query;

    if (error) {
      console.error("Transactions query error:", error);
    }

    const transactions: AdminTransactionItem[] = (dbTxns || []).map((t: any) => ({
      id: t.id,
      userId: t.user_id,
      customerName: t.profiles?.full_name || t.profiles?.email?.split("@")[0] || "User",
      customerEmail: t.profiles?.email || "—",
      amount: Number(t.amount || 0),
      type: t.type || "purchase",
      status: t.status || "completed",
      reference: t.reference,
      description: t.description,
      metadata: t.metadata || {},
      createdAt: t.created_at,
    }));

    const totalInflow = transactions
      .filter((t) => (t.type === "deposit" || t.type === "bonus") && t.status === "completed")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalOutflow = transactions
      .filter((t) => (t.type === "purchase" || t.type === "withdrawal") && t.status === "completed")
      .reduce((sum, t) => sum + t.amount, 0);

    return NextResponse.json({
      success: true,
      transactions,
      stats: {
        totalCount: transactions.length,
        totalInflow,
        totalOutflow,
        netFlow: totalInflow - totalOutflow,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
