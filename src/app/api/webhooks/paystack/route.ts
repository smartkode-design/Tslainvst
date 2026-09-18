import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { PaystackService } from "@/lib/providers/paystack";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    // 1. Verify cryptographic HMAC-SHA512 signature
    if (!PaystackService.verifyWebhookSignature(rawBody, signature)) {
      console.warn("Paystack Webhook: Invalid signature rejected.");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    let event: any;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    // Only process charge.success events
    if (event.event !== "charge.success") {
      return NextResponse.json({ message: `Ignored event ${event.event}` }, { status: 200 });
    }

    const data = event.data;
    const reference = String(data.reference || "").trim();
    const rawAmount = data.amount; // in kobo
    const amountNGN = Math.floor(Number(rawAmount) / 100);
    const customerEmail = String(data.customer?.email || "").trim().toLowerCase();

    if (!reference || isNaN(amountNGN) || amountNGN <= 0) {
      console.error("Paystack Webhook: Missing or invalid amount/reference", { reference, amountNGN });
      return NextResponse.json({ error: "Invalid transaction payload" }, { status: 400 });
    }

    // 2. Idempotency Check: Prevent duplicate crediting
    const { data: existingTx } = await supabaseAdmin
      .from("transactions")
      .select("id, status")
      .eq("reference", reference)
      .single();

    if (existingTx) {
      console.log("Paystack Webhook: Transaction already processed:", reference);
      return NextResponse.json({ message: "Transaction already processed" }, { status: 200 });
    }

    // 3. Resolve user profile
    let targetUserId = data.metadata?.userId;

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
      console.error("Paystack Webhook: Could not find user for email:", customerEmail);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 4. Fetch wallet
    const { data: wallet, error: walletErr } = await supabaseAdmin
      .from("wallets")
      .select("id, balance")
      .eq("user_id", targetUserId)
      .single();

    if (walletErr || !wallet) {
      console.error("Paystack Webhook: Wallet not found for user:", targetUserId);
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    const currentBalance = Number(wallet.balance || 0);
    const newBalance = Number((currentBalance + amountNGN).toFixed(2));

    // 5. Update wallet balance
    const { error: updateErr } = await supabaseAdmin
      .from("wallets")
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq("id", wallet.id);

    if (updateErr) {
      console.error("Paystack Webhook: Error crediting wallet:", updateErr);
      return NextResponse.json({ error: "Failed to credit balance" }, { status: 500 });
    }

    // 6. Record transaction audit
    await supabaseAdmin.from("transactions").insert({
      user_id: targetUserId,
      amount: amountNGN,
      type: "deposit",
      status: "completed",
      reference,
      description: `Paystack Deposit (₦${amountNGN.toLocaleString()})`,
      metadata: {
        provider: "paystack",
        channel: data.channel,
        gateway_response: data.gateway_response,
        paid_at: data.paid_at,
        customer_email: customerEmail,
        ip_address: data.ip_address,
      },
    });

    console.log(`[Paystack Webhook] Successfully credited ₦${amountNGN.toLocaleString()} to ${customerEmail}`);
    return NextResponse.json({ success: true, reference, newBalance });
  } catch (error: any) {
    console.error("Paystack Webhook unexpected error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
