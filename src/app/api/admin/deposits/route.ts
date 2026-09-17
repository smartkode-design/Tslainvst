import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export interface AdminDepositItem {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  status: "completed" | "pending" | "failed";
  reference: string;
  description: string;
  paymentMethod: string;
  bankName: string;
  senderName: string | null;
  createdAt: string;
}

export async function GET() {
  try {
    const { data: dbDeposits, error } = await supabaseAdmin
      .from("transactions")
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          email
        )
      `)
      .eq("type", "deposit")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Deposits query error:", error);
    }

    const deposits: AdminDepositItem[] = (dbDeposits || []).map((d: any) => ({
      id: d.id,
      userId: d.user_id,
      customerName: d.profiles?.full_name || d.profiles?.email?.split("@")[0] || "User",
      customerEmail: d.profiles?.email || "—",
      amount: Number(d.amount || 0),
      status: d.status || "completed",
      reference: d.reference,
      description: d.description,
      paymentMethod: d.metadata?.payment_method || (d.reference.startsWith("ADM-") ? "Admin Credit" : "Payvessel Transfer"),
      bankName: d.metadata?.bank_name || "Wema Bank",
      senderName: d.metadata?.sender_name || null,
      createdAt: d.created_at,
    }));

    const totalDeposited = deposits
      .filter((d) => d.status === "completed")
      .reduce((sum, d) => sum + d.amount, 0);

    return NextResponse.json({
      success: true,
      deposits,
      stats: {
        totalDepositsCount: deposits.length,
        totalDepositedAmount: totalDeposited,
        successfulCount: deposits.filter((d) => d.status === "completed").length,
        pendingCount: deposits.filter((d) => d.status === "pending").length,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
