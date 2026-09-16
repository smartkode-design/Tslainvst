import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { FiveSimService } from "@/lib/providers/fivesim";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, country = "usa", service = "whatsapp", retailPrice = 1200 } = body;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized / Missing userId" }, { status: 401 });
    }

    // 1. Check user wallet balance
    const { data: wallet, error: walletErr } = await supabaseAdmin
      .from("wallets")
      .select("balance")
      .eq("user_id", userId)
      .single();

    if (walletErr || !wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    if (Number(wallet.balance) < retailPrice) {
      return NextResponse.json(
        { error: "Insufficient wallet balance. Please fund your wallet first." },
        { status: 400 }
      );
    }

    // 2. Call 5SIM API to acquire number
    const fiveSimOrder = await FiveSimService.buyNumber(country, "any", service);

    // 3. Deduct retail price from user wallet
    const newBalance = Number(wallet.balance) - retailPrice;
    await supabaseAdmin
      .from("wallets")
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq("user_id", userId);

    // 4. Record transaction audit
    await supabaseAdmin.from("transactions").insert({
      user_id: userId,
      amount: retailPrice,
      type: "purchase",
      status: "completed",
      reference: `SMS_${fiveSimOrder.id}_${Date.now()}`,
      description: `Purchased ${country.toUpperCase()} ${service.toUpperCase()} Virtual Line`,
      metadata: { orderId: fiveSimOrder.id, phone: fiveSimOrder.phone },
    });

    // 5. Create order record
    const { data: orderRecord, error: orderErr } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: userId,
        service_type: "sms",
        provider: "5sim",
        provider_order_id: String(fiveSimOrder.id),
        service_name: `${country.toUpperCase()} ${service.toUpperCase()}`,
        target: fiveSimOrder.phone,
        amount_ngn: retailPrice,
        cost_usd: fiveSimOrder.price,
        status: "pending",
        details: fiveSimOrder,
      })
      .select("id")
      .single();

    return NextResponse.json({
      success: true,
      orderId: fiveSimOrder.id,
      systemOrderId: orderRecord?.id,
      phone: fiveSimOrder.phone,
      expires: fiveSimOrder.expires,
      newBalance,
    });
  } catch (error: any) {
    console.error("Error in /api/services/sms/buy:", error);
    return NextResponse.json({ error: error.message || "Failed to buy SMS number" }, { status: 500 });
  }
}
