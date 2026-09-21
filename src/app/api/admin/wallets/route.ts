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
    const [{ data: profiles, error: pErr }, { data: wallets, error: wErr }] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("id, full_name, email, role, created_at")
        .order("created_at", { ascending: false }),
      supabaseAdmin
        .from("wallets")
        .select("*")
        .order("balance", { ascending: false }),
    ]);

    if (pErr) throw pErr;
    if (wErr) throw wErr;

    const walletMap = new Map((wallets || []).map((w: any) => [w.user_id, w]));

    const walletList: AdminWalletItem[] = (profiles || []).map((p: any) => {
      const w = walletMap.get(p.id);
      return {
        id: w?.id || `uninit-${p.id}`,
        userId: p.id,
        userName: p.full_name || p.email?.split("@")[0] || "User",
        userEmail: p.email || "—",
        balance: Number(w?.balance || 0),
        currency: w?.currency || "NGN",
        payvesselAccount: w?.payvessel_account_number || null,
        bankName: w?.bank_name || "Wema Bank",
        accountName: w?.account_name || null,
        createdAt: w?.created_at || p.created_at,
      };
    });

    // Sort by balance descending
    walletList.sort((a, b) => b.balance - a.balance);

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

    // Fetch existing wallet or auto-create if missing
    let { data: wallet } = await supabaseAdmin
      .from("wallets")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (!wallet) {
      // Auto-create missing wallet row
      const { data: newWallet, error: createErr } = await supabaseAdmin
        .from("wallets")
        .insert({
          user_id: userId,
          balance: 0,
          currency: "NGN",
        })
        .select()
        .single();

      if (createErr) {
        throw new Error(`Failed to initialize wallet: ${createErr.message}`);
      }
      wallet = newWallet;
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
    // Explicitly include user_id so Postgres WAL includes it in payload.new for Supabase Realtime filters!
    const { error: updateErr } = await supabaseAdmin
      .from("wallets")
      .update({
        user_id: userId,
        balance: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (updateErr) throw updateErr;

    // 2. Insert audit transaction (INSERT always emits full row including user_id)
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
