import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { FiveSimService } from "@/lib/providers/fivesim";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    // 1. Fetch order from Supabase
    const { data: order, error: orderErr } = await supabaseAdmin
      .from("orders")
      .select("id, user_id, amount_ngn, status")
      .eq("provider_order_id", String(orderId))
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status === "refunded") {
      return NextResponse.json({ success: true, message: "Order is already refunded" });
    }

    // 2. Cancel order on 5SIM if provider is 5sim
    try {
      await FiveSimService.cancelOrder(orderId);
    } catch (e: any) {
      console.warn("5SIM cancel call warning:", e.message);
    }

    // 3. Refund user wallet in Supabase
    const { data: wallet } = await supabaseAdmin
      .from("wallets")
      .select("id, balance")
      .eq("user_id", order.user_id)
      .single();

    if (wallet) {
      const refundAmount = Number(order.amount_ngn || 0);
      const newBalance = Number((Number(wallet.balance) + refundAmount).toFixed(2));

      await supabaseAdmin
        .from("wallets")
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq("id", wallet.id);

      await supabaseAdmin
        .from("orders")
        .update({ status: "refunded", updated_at: new Date().toISOString() })
        .eq("id", order.id);

      await supabaseAdmin.from("transactions").insert({
        user_id: order.user_id,
        amount: refundAmount,
        type: "refund",
        status: "completed",
        reference: "REF_" + orderId + "_" + Date.now(),
        description: "Manual cancellation refund for Virtual Number Order #" + orderId,
      });

      return NextResponse.json({
        success: true,
        message: "Order #" + orderId + " canceled. ₦" + refundAmount.toLocaleString() + " has been refunded to your wallet.",
        newBalance,
      });
    }

    return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
  } catch (err: any) {
    console.error("Error in /api/services/sms/cancel:", err);
    return NextResponse.json({ error: err.message || "Failed to cancel order" }, { status: 500 });
  }
}
