import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { FiveSimService } from "@/lib/providers/fivesim";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { orderId, reason } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    // 1. Fetch order from Supabase by UUID (id) OR provider_order_id
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(orderId));
    let query = supabaseAdmin
      .from("orders")
      .select("id, user_id, provider_order_id, service_name, target, details, amount_ngn, status")
      .eq("service_type", "sms");

    if (isUUID) {
      query = query.eq("id", String(orderId));
    } else {
      query = query.eq("provider_order_id", String(orderId));
    }

    const { data: order, error: orderErr } = await query.maybeSingle();

    if (orderErr || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status === "refunded" || order.status === "canceled") {
      return NextResponse.json({ success: true, message: "Order is already refunded" });
    }

    if (order.status === "completed") {
      return NextResponse.json({ error: "Completed orders with delivered SMS cannot be refunded" }, { status: 400 });
    }

    // 2. Cancel order on 5SIM if provider is 5sim
    const pId = order.provider_order_id || String(orderId);
    try {
      if (reason === "banned") {
        await FiveSimService.banOrder(pId);
      } else {
        await FiveSimService.cancelOrder(pId);
      }
    } catch (e: any) {
      console.warn("5SIM cancel/ban call warning:", e.message);
    }

    // 3. Refund user wallet in Supabase
    const { data: wallet } = await supabaseAdmin
      .from("wallets")
      .select("id, balance")
      .eq("user_id", order.user_id)
      .maybeSingle();

    if (wallet) {
      const refundAmount = Number(order.amount_ngn || 0);
      const newBalance = Number((Number(wallet.balance) + refundAmount).toFixed(2));

      await supabaseAdmin
        .from("wallets")
        .update({
          user_id: order.user_id,
          balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq("id", wallet.id);

      await supabaseAdmin
        .from("orders")
        .update({
          status: "refunded",
          details: {
            ...((order.details as Record<string, any>) || {}),
            cancel_reason: reason || "Manual cancellation",
            canceled_at: new Date().toISOString(),
          },
          updated_at: new Date().toISOString()
        })
        .eq("id", order.id);

      await supabaseAdmin.from("transactions").insert({
        user_id: order.user_id,
        amount: refundAmount,
        type: "refund",
        status: "completed",
        reference: "REF_" + (order.provider_order_id || order.id.slice(0, 8)) + "_" + Date.now(),
        description: `Manual cancellation refund for Virtual Line (${order.service_name || "SMS"}): ${order.target || ""}`,
        metadata: {
          order_id: order.id,
          reason: reason || "Vendor manual cancellation",
          phone: order.target,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Order canceled. ₦${refundAmount.toLocaleString()} has been refunded to your wallet.`,
        newBalance,
      });
    }

    return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
  } catch (err: any) {
    console.error("Error in /api/services/sms/cancel:", err);
    return NextResponse.json({ error: err.message || "Failed to cancel order" }, { status: 500 });
  }
}
