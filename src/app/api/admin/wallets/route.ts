import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export interface AdminWalletItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  balance: number;
  currency: string;
  payvesselAccount: string | null;
  bankName: string | null;
  accountName: string | null;
  createdAt: string;
}

export async function GET() {
  try {
    const { data: wallets, error: wErr } = await supabaseAdmin
      .from("wallets")
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          email,
          role
        )
      `)
      .order("balance", { ascending: false });

    if (wErr) throw wErr;

    const walletList: AdminWalletItem[] = (wallets || []).map((w: any) => ({
      id: w.id,
      userId: w.user_id,
      userName: w.profiles?.full_name || w.profiles?.email?.split("@")[0] || "User",
      userEmail: w.profiles?.email || "—",
      balance: Number(w.balance || 0),
      currency: w.currency || "NGN",
      payvesselAccount: w.payvessel_account_number || null,
      bankName: w.bank_name || "Wema Bank",
      accountName: w.account_name || null,
      createdAt: w.created_at,
    }));

    const totalFloat = walletList.reduce((sum, w) => sum + w.balance, 0);
    const highestBalance = walletList.length > 0 ? Math.max(...walletList.map((w) => w.balance)) : 0;

    return NextResponse.json({
      success: true,
      wallets: walletList,
      stats: {
        totalWallets: walletList.length,
        totalFloat,
        highestBalance,
        averageBalance: walletList.length > 0 ? totalFloat / walletList.length : 0,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, type, amount, reason } = body;

    if (!userId || !amount || Number(amount) <= 0) {
      return NextResponse.json({ success: false, error: "Valid user ID and amount are required" }, { status: 400 });
    }

    const numAmount = Number(amount);

    // Fetch existing wallet
    const { data: wallet, error: wErr } = await supabaseAdmin
      .from("wallets")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (wErr || !wallet) {
      return NextResponse.json({ success: false, error: "Wallet not found for this user" }, { status: 404 });
    }

    const currentBalance = Number(wallet.balance || 0);
    let newBalance = currentBalance;

    if (type === "credit") {
      newBalance = currentBalance + numAmount;
    } else if (type === "debit") {
      if (currentBalance < numAmount) {
        return NextResponse.json({ success: false, error: "Insufficient wallet balance to debit" }, { status: 400 });
      }
      newBalance = currentBalance - numAmount;
    } else {
      return NextResponse.json({ success: false, error: "Invalid operation type. Must be 'credit' or 'debit'" }, { status: 400 });
    }

    // 1. Update wallet balance
    const { error: updateErr } = await supabaseAdmin
      .from("wallets")
      .update({
        balance: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (updateErr) throw updateErr;

    // 2. Insert audit transaction
    const txRef = `ADM-${type.toUpperCase()}-${Date.now()}`;
    await supabaseAdmin.from("transactions").insert([
      {
        user_id: userId,
        amount: numAmount,
        type: type === "credit" ? "deposit" : "withdrawal",
        status: "completed",
        reference: txRef,
        description: `System ${type === "credit" ? "Credit" : "Adjustment"}: ${reason || "Automated wallet balance adjustment"}`,
        metadata: {
          adjusted_by: "admin",
          previous_balance: currentBalance,
          new_balance: newBalance,
          reason,
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      newBalance,
      message: `Wallet successfully ${type === "credit" ? "credited" : "debited"} with ₦${numAmount.toLocaleString()}`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
