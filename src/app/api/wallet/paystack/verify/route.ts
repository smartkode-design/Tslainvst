import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { PaystackService } from "@/lib/providers/paystack";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json({ error: "Missing transaction reference" }, { status: 400 });
    }

    const cleanRef = reference.trim();

    // 1. Check if transaction already credited in local database
    const { data: existingTx } = await supabaseAdmin
      .from("transactions")
      .select("id, amount, status")
      .eq("reference", cleanRef)
      .single();

    if (existingTx) {
      return NextResponse.json({
        success: true,
        alreadyProcessed: true,
        amount: existingTx.amount,
        status: existingTx.status,
      });
    }

    // 2. Verify with Paystack API
    const paystackTx = await PaystackService.verifyTransaction(cleanRef);

    if (paystackTx.status !== "success") {
      return NextResponse.json(
        {
          error: `Payment is not marked as successful. Current status: ${paystackTx.status}`,
          status: paystackTx.status,
        },
        { status: 400 }
      );
    }

    const amountNGN = Math.floor(paystackTx.amount / 100);
    const customerEmail = paystackTx.customer?.email?.toLowerCase().trim();
    let targetUserId = paystackTx.metadata?.userId;

    if (!targetUserId && customerEmail) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .ilike("email", customerEmail)
        .single();
      if (profile) {
        targetUserId = profile.id;
      }
    }

    if (!targetUserId) {
      return NextResponse.json(
        { error: "Could not associate transaction with a TSLA user profile" },
        { status: 404 }
      );
    }

    // 3. Fetch user wallet
    const { data: wallet, error: walletErr } = await supabaseAdmin
      .from("wallets")
      .select("id, balance")
      .eq("user_id", targetUserId)
      .single();

    if (walletErr || !wallet) {
      return NextResponse.json({ error: "Wallet not found for this user" }, { status: 404 });
    }

    const currentBalance = Number(wallet.balance || 0);
    const newBalance = Number((currentBalance + amountNGN).toFixed(2));

    // 4. Update wallet balance
    const { error: updateErr } = await supabaseAdmin
      .from("wallets")
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq("id", wallet.id);

    if (updateErr) {
      console.error("Failed to update wallet on Paystack verify:", updateErr);
      return NextResponse.json({ error: "Failed to credit wallet balance" }, { status: 500 });
    }

    // 5. Record transaction audit log
    await supabaseAdmin.from("transactions").insert({
      user_id: targetUserId,
      amount: amountNGN,
      type: "deposit",
      status: "completed",
      reference: cleanRef,
      description: `Paystack Deposit (₦${amountNGN.toLocaleString()})`,
      metadata: {
        provider: "paystack",
        channel: paystackTx.channel,
        gateway_response: paystackTx.gateway_response,
        paid_at: paystackTx.paid_at,
        customer_email: customerEmail,
      },
    });

    return NextResponse.json({
      success: true,
      amount: amountNGN,
      newBalance,
      reference: cleanRef,
    });
  } catch (error: any) {
    console.error("Paystack verification error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify transaction" },
      { status: 500 }
    );
  }
}
