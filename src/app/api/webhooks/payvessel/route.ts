import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { PayvesselService } from "@/lib/providers/payvessel";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    
    // Check all possible header casings sent by Payvessel
    const signature = 
      req.headers.get("payvessel-http-signature") || 
      req.headers.get("http_payvessel_http_signature") || 
      req.headers.get("HTTP_PAYVESSEL_HTTP_SIGNATURE") || 
      req.headers.get("x-payvessel-signature") || "";

    if (!PayvesselService.verifyWebhookSignature(rawBody, signature)) {
      console.warn("Payvessel Webhook: Invalid signature attempt rejected.");
      return NextResponse.json({ error: "Invalid cryptographic signature" }, { status: 401 });
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    /**
     * Payvessel payload structure:
     * {
     *   "order": {
     *     "amount": 5000,
     *     "reference": "PV_12345678",
     *     "currency": "NGN",
     *     "settlement_amount": 4950,
     *     "customer": { "email": "user@example.com" }
     *   }
     * }
     */
    const order = payload.order || payload;
    const rawAmount = order.amount ?? order.settlement_amount;
    const amount = Number(rawAmount);
    const reference = String(order.reference || "").trim();
    const customerEmail = String(order.customer?.email || order.email || "").trim().toLowerCase();

    // 1. Validate amount and inputs
    if (!customerEmail || isNaN(amount) || amount <= 0) {
      console.error("Payvessel Webhook: Invalid amount or email", { amount, customerEmail, reference });
      return NextResponse.json({ error: "Invalid amount or customer email" }, { status: 400 });
    }

    if (!reference) {
      return NextResponse.json({ error: "Missing transaction reference" }, { status: 400 });
    }

    // 2. Find profile by email
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from("profiles")
      .select("id, email, full_name")
      .ilike("email", customerEmail)
      .single();

    if (profileErr || !profile) {
      console.error("Payvessel Webhook: Profile not found for email:", customerEmail);
      return NextResponse.json({ error: "User profile not found for this email" }, { status: 404 });
    }

    // 3. Idempotency Check: Prevent duplicate processing and replay attacks
    const { data: existingTx } = await supabaseAdmin
      .from("transactions")
      .select("id, status")
      .eq("reference", reference)
      .single();

    if (existingTx) {
      console.log("Payvessel Webhook: Transaction already processed:", reference);
      return NextResponse.json({ message: "Transaction already processed successfully" }, { status: 200 });
    }

    // 4. Fetch current wallet balance
    const { data: wallet, error: walletErr } = await supabaseAdmin
      .from("wallets")
      .select("id, balance")
      .eq("user_id", profile.id)
      .single();

    if (walletErr || !wallet) {
      console.error("Payvessel Webhook: Wallet not found for user:", profile.id);
      return NextResponse.json({ error: "User wallet not found" }, { status: 404 });
    }

    const currentBalance = Number(wallet.balance || 0);
    const newBalance = Number((currentBalance + amount).toFixed(2));

    // 5. Update wallet balance
    const { error: updateErr } = await supabaseAdmin
      .from("wallets")
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq("id", wallet.id);

    if (updateErr) {
      console.error("Payvessel Webhook: Failed to credit wallet balance:", updateErr);
      return NextResponse.json({ error: "Failed to credit balance" }, { status: 500 });
    }

    // 6. Record transaction audit log
    await supabaseAdmin.from("transactions").insert({
      user_id: profile.id,
      amount,
      type: "deposit",
      status: "completed",
      reference,
      description: `Automated Bank Transfer Deposit (₦${amount.toLocaleString()})`,
      metadata: {
        provider: "payvessel",
        bank: order.bank_name || order.bankCode || "Bank Transfer",
        settlement_amount: order.settlement_amount,
        sender_name: order.customer?.name || null,
        received_at: new Date().toISOString(),
      },
    });

    console.log(`[Payvessel] Credited ₦${amount.toLocaleString()} to ${customerEmail} (New balance: ₦${newBalance.toLocaleString()})`);
    return NextResponse.json({ success: true, reference, newBalance });
  } catch (error: any) {
    console.error("Error processing Payvessel webhook:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
