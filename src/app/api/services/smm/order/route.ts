import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { JapService, CURATED_SMM_CATALOG } from "@/lib/providers/jap";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, serviceId, link, quantity = 1000 } = body;

    if (!userId || !serviceId || !link || !quantity) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Find service in curated catalog
    const service = CURATED_SMM_CATALOG.find((s) => s.id === serviceId || s.japServiceId === Number(serviceId));
    if (!service) {
      return NextResponse.json({ error: "Invalid or unsupported service selected" }, { status: 400 });
    }

    if (quantity < service.minQuantity || quantity > service.maxQuantity) {
      return NextResponse.json(
        { error: `Quantity must be between ${service.minQuantity} and ${service.maxQuantity}` },
        { status: 400 }
      );
    }

    // 2. Calculate retail cost in NGN
    const totalCostNGN = Math.round((quantity / 1000) * service.retailPriceNGN);
    const estimatedWholesaleCostUSD = Number(((quantity / 1000) * service.wholesaleCostUSD).toFixed(4));

    // 3. Verify user wallet balance
    const { data: wallet, error: walletErr } = await supabaseAdmin
      .from("wallets")
      .select("balance")
      .eq("user_id", userId)
      .single();

    if (walletErr || !wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    if (Number(wallet.balance) < totalCostNGN) {
      return NextResponse.json(
        { error: `Insufficient wallet balance. Required: ₦${totalCostNGN.toLocaleString()}` },
        { status: 400 }
      );
    }

    // 4. Place order with JAP
    const japOrder = await JapService.createOrder(service.japServiceId, link, quantity);

    // 5. Deduct from user wallet
    const newBalance = Number(wallet.balance) - totalCostNGN;
    await supabaseAdmin
      .from("wallets")
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq("user_id", userId);

    // 6. Record transaction
    await supabaseAdmin.from("transactions").insert({
      user_id: userId,
      amount: totalCostNGN,
      type: "purchase",
      status: "completed",
      reference: `SMM_${japOrder.order}_${Date.now()}`,
      description: `Boost: ${quantity.toLocaleString()} ${service.name}`,
      metadata: { orderId: japOrder.order, link, serviceId: service.japServiceId },
    });

    // 7. Record order
    const { data: orderRecord } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: userId,
        service_type: "smm",
        provider: "jap",
        provider_order_id: String(japOrder.order),
        service_name: service.name,
        target: link,
        quantity,
        amount_ngn: totalCostNGN,
        cost_usd: estimatedWholesaleCostUSD,
        status: "processing",
        details: { japOrder, service },
      })
      .select("id")
      .single();

    return NextResponse.json({
      success: true,
      orderId: japOrder.order,
      systemOrderId: orderRecord?.id,
      newBalance,
      serviceName: service.name,
      amountCharged: totalCostNGN,
    });
  } catch (error: any) {
    console.error("Error in /api/services/smm/order:", error);
    return NextResponse.json({ error: error.message || "Failed to place SMM order" }, { status: 500 });
  }
}
