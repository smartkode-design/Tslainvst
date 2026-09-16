import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { FiveSimService } from "@/lib/providers/fivesim";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const checkResult = await FiveSimService.checkOrder(orderId);

    // If SMS received, extract code and update database
    if (checkResult.status === "RECEIVED" && checkResult.sms && checkResult.sms.length > 0) {
      const latestSms = checkResult.sms[checkResult.sms.length - 1];

      await supabaseAdmin
        .from("orders")
        .update({
          status: "completed",
          otp_code: latestSms.code,
          details: checkResult,
          updated_at: new Date().toISOString(),
        })
        .eq("provider_order_id", String(orderId));

      return NextResponse.json({
        status: "RECEIVED",
        code: latestSms.code,
        sender: latestSms.sender,
        text: latestSms.text,
      });
    }

    // If canceled/timed out by provider, auto-refund user
    if (checkResult.status === "CANCELED" || checkResult.status === "TIMEOUT") {
      const { data: order } = await supabaseAdmin
        .from("orders")
        .select("id, user_id, amount_ngn, status")
        .eq("provider_order_id", String(orderId))
        .single();

      if (order && order.status !== "refunded") {
        // Refund wallet
        const { data: wallet } = await supabaseAdmin
          .from("wallets")
          .select("balance")
          .eq("user_id", order.user_id)
          .single();

        const newBalance = Number(wallet?.balance || 0) + Number(order.amount_ngn);
        await supabaseAdmin
          .from("wallets")
          .update({ balance: newBalance, updated_at: new Date().toISOString() })
          .eq("user_id", order.user_id);

        // Update order status
        await supabaseAdmin
          .from("orders")
          .update({ status: "refunded", updated_at: new Date().toISOString() })
          .eq("id", order.id);

        // Record transaction
        await supabaseAdmin.from("transactions").insert({
          user_id: order.user_id,
          amount: order.amount_ngn,
          type: "refund",
          status: "completed",
          reference: `REF_${orderId}_${Date.now()}`,
          description: `Auto-Refund for Expired / Canceled SMS Order #${orderId}`,
        });
      }

      return NextResponse.json({
        status: checkResult.status,
        message: "Order canceled. Full refund credited back to wallet.",
      });
    }

    return NextResponse.json({
      status: checkResult.status,
      message: "Waiting for SMS OTP...",
    });
  } catch (error: any) {
    console.error("Error in /api/services/sms/check:", error);
    return NextResponse.json({ error: error.message || "Failed to check SMS status" }, { status: 500 });
  }
}
