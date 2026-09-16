import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { PayvesselService } from "@/lib/providers/payvessel";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("payvessel-http-signature") || "";

    if (!PayvesselService.verifyWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
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
    const amount = Number(order.amount);
    const reference = order.reference || `PV_${Date.now()}`;
    const customerEmail = order.customer?.email;

    if (!customerEmail || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Find profile by email
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", customerEmail)
      .single();

    if (profileErr || !profile) {
      console.error("Payvessel Webhook: Profile not found for email:", customerEmail);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Check if transaction already processed (idempotency)
    const { data: existingTx } = await supabaseAdmin
      .from("transactions")
      .select("id")
      .eq("reference", reference)
      .single();

    if (existingTx) {
      return NextResponse.json({ message: "Transaction already processed" }, { status: 200 });
    }

    // 3. Record transaction
    await supabaseAdmin.from("transactions").insert({
      user_id: profile.id,
      amount,
      type: "deposit",
      status: "completed",
      reference,
      description: `Automated Bank Transfer Deposit (₦${amount.toLocaleString()})`,
      metadata: payload,
    });

    // 4. Update wallet balance
    const { data: wallet } = await supabaseAdmin
      .from("wallets")
      .select("balance")
      .eq("user_id", profile.id)
      .single();

    const currentBalance = Number(wallet?.balance || 0);
    const newBalance = currentBalance + amount;

    await supabaseAdmin
      .from("wallets")
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq("user_id", profile.id);

    return NextResponse.json({ success: true, newBalance });
  } catch (error: any) {
    console.error("Error processing Payvessel webhook:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
