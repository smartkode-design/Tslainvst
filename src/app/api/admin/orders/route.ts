import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export interface AdminOrder {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  serviceType: "sms" | "smm" | "log";
  provider: "5sim" | "jap" | "marketplace" | "manual";
  providerOrderId: string;
  serviceName: string;
  target: string;
  quantity: number;
  amountNgn: number;
  costUsd: number;
  status: "pending" | "processing" | "completed" | "canceled" | "refunded";
  otpCode: string | null;
  details: any;
  createdAt: string;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status");

    let query = supabaseAdmin
      .from("orders")
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          email
        )
      `)
      .order("created_at", { ascending: false });

    if (statusFilter && statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    const { data: dbOrders, error } = await query;

    if (error) {
      console.error("Orders query error:", error);
    }

    const orders: AdminOrder[] = (dbOrders || []).map((o: any) => ({
      id: o.id,
      userId: o.user_id,
      customerName: o.profiles?.full_name || o.profiles?.email?.split("@")[0] || "User",
      customerEmail: o.profiles?.email || "—",
      serviceType: o.service_type || "sms",
      provider: o.provider || "manual",
      providerOrderId: o.provider_order_id || "—",
      serviceName: o.service_name || "Platform Service",
      target: o.target || "—",
      quantity: Number(o.quantity || 1),
      amountNgn: Number(o.amount_ngn || 0),
      costUsd: Number(o.cost_usd || 0),
      status: o.status || "pending",
      otpCode: o.otp_code || null,
      details: o.details || {},
      createdAt: o.created_at,
    }));

    const stats = {
      total: orders.length,
      completed: orders.filter((o) => o.status === "completed").length,
      pending: orders.filter((o) => o.status === "pending" || o.status === "processing").length,
      refunded: orders.filter((o) => o.status === "refunded" || o.status === "canceled").length,
      totalVolumeNgn: orders.reduce((sum, o) => sum + o.amountNgn, 0),
    };

    return NextResponse.json({ success: true, orders, stats });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { orderId, status, refundWallet } = body;

    if (!orderId || !status) {
      return NextResponse.json({ success: false, error: "Order ID and status required" }, { status: 400 });
    }

    // 1. Fetch order details
    const { data: order, error: oErr } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (oErr || !order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    // 2. If status is being updated to refunded/cancelled and refundWallet is requested:
    if ((status === "refunded" || status === "canceled") && refundWallet && order.status !== "refunded") {
      const refundAmount = Number(order.amount_ngn || 0);

      // Fetch user wallet
      const { data: wallet } = await supabaseAdmin
        .from("wallets")
        .select("balance")
        .eq("user_id", order.user_id)
        .single();

      if (wallet) {
        const newBalance = Number(wallet.balance) + refundAmount;
        await supabaseAdmin
          .from("wallets")
          .update({ balance: newBalance })
          .eq("user_id", order.user_id);

        // Record refund in transactions table
        await supabaseAdmin.from("transactions").insert([
          {
            user_id: order.user_id,
            amount: refundAmount,
            type: "refund",
            status: "completed",
            reference: `REFUND-${Date.now()}-${orderId.slice(0, 8)}`,
            description: `Admin refund for ${order.service_name} (Order #${orderId.slice(0, 8)})`,
            metadata: { order_id: orderId },
          },
        ]);
      }
    }

    // 3. Update order status
    const { error: updateErr } = await supabaseAdmin
      .from("orders")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (updateErr) throw updateErr;

    return NextResponse.json({ success: true, message: `Order marked as ${status}` });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
