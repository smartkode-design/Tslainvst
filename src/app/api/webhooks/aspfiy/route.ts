import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AspfiyService } from "@/lib/providers/aspfiy";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    
    // 1. Signature Check
    const signature = 
      req.headers.get("x-wiaxy-signature") || 
      req.headers.get("X-Wiaxy-Signature") || 
      req.headers.get("x-aspfiy-signature") || "";

    if (!AspfiyService.verifyWebhookSignature(signature)) {
      console.warn("Aspfiy Webhook: Invalid or missing x-wiaxy-signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    console.log("Aspfiy Webhook received payload:", JSON.stringify(payload));

    const event = payload.event;
    const data = payload.data || payload;

    // We process payment notification events
    if (event && !event.toUpperCase().includes("PAYMENT")) {
      return NextResponse.json({ message: "Ignored event" }, { status: 200 });
    }

    const amount = Number(data.amount);
    const reference = String(data.reference || data.aspfiy_ref || `ASP_${Date.now()}`).trim();
    const accountNumber = String(data.account?.account_number || "").trim();
    const bankName = String(data.account?.bank_name || "Paga").trim();
    const merchantRef = String(data.merchant_reference || "").trim();

    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid deposit amount" }, { status: 400 });
    }

    // 2. Idempotency Check: Don't double credit
    const { data: existingTx } = await supabaseAdmin
      .from("transactions")
      .select("id")
      .eq("reference", reference)
      .single();

    if (existingTx) {
      console.log("Aspfiy Webhook: Transaction already credited:", reference);
      return NextResponse.json({ message: "Transaction already processed" }, { status: 200 });
    }

    // 3. Find User's Wallet by Account Number OR Reference
    let targetUserId: string | null = null;

    if (accountNumber) {
      const { data: walletMatch } = await supabaseAdmin
        .from("wallets")
        .select("user_id")
        .eq("payvessel_account_number", accountNumber)
        .single();
      
      if (walletMatch) {
        targetUserId = walletMatch.user_id;
      }
    }

    // Fallback: If not found by account number, match by merchant_reference
    if (!targetUserId && merchantRef) {
      // merchantRef has format: TSLA_<userIdPrefix>_<timestamp>
      const parts = merchantRef.split("_");
      if (parts.length >= 2) {
        const prefix = parts[1];
        // Search profiles whose ID starts with or contains the prefix
        const { data: profileMatch } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .ilike("id", `${prefix}%`)
          .single();

        if (profileMatch) {
          targetUserId = profileMatch.id;
        }
      }
    }

    if (!targetUserId) {
      console.error("Aspfiy Webhook: Could not match deposit to any TSLA user", { accountNumber, merchantRef });
      return NextResponse.json({ error: "User wallet not found for this account number" }, { status: 404 });
    }

    // 4. Fetch current wallet balance
    const { data: wallet, error: walletErr } = await supabaseAdmin
      .from("wallets")
      .select("id, balance")
      .eq("user_id", targetUserId)
      .single();

    if (walletErr || !wallet) {
      return NextResponse.json({ error: "Wallet record not found" }, { status: 404 });
    }

    const currentBal = Number(wallet.balance || 0);
    const newBal = Number((currentBal + amount).toFixed(2));

    // 5. Update wallet balance
    const { error: updateErr } = await supabaseAdmin
      .from("wallets")
      .update({
        balance: newBal,
        updated_at: new Date().toISOString(),
      })
      .eq("id", wallet.id);

    if (updateErr) {
      console.error("Aspfiy Webhook: Failed to update balance:", updateErr);
      return NextResponse.json({ error: "Failed to credit balance" }, { status: 500 });
    }

    // 6. Record transaction
    const payerName = [data.payer?.first_name, data.payer?.last_name].filter(Boolean).join(" ").trim();
    await supabaseAdmin.from("transactions").insert({
      user_id: targetUserId,
      amount,
      type: "deposit",
      status: "completed",
      reference,
      description: `Automated Bank Transfer Deposit via ${bankName} (₦${amount.toLocaleString()})${payerName ? ` from ${payerName}` : ""}`,
      metadata: {
        provider: "aspfiy",
        account_number: accountNumber,
        bank_name: bankName,
        payer: data.payer,
        aspfiy_ref: data.aspfiy_ref,
      },
    });

    console.log(`Aspfiy Webhook: Successfully credited ₦${amount} to user ${targetUserId}. New balance: ₦${newBal}`);
    return NextResponse.json({ status: true, message: "Deposit processed successfully" });
  } catch (err: any) {
    console.error("Aspfiy Webhook handler error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
