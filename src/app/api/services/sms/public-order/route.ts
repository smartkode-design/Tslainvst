import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { FiveSimService } from "@/lib/providers/fivesim";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Missing verification token" }, { status: 400 });
    }

    // 1. Look up order by system UUID (id) OR provider_order_id (5sim id)
    // Only query SMS orders to prevent unauthorized access to other order types
    let query = supabaseAdmin
      .from("orders")
      .select("id, user_id, provider_order_id, service_name, target, details, status, otp_code, created_at, amount_ngn")
      .eq("service_type", "sms");

    // Check if token matches standard UUID format or provider order ID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token);
    if (isUUID) {
      query = query.eq("id", token);
    } else {
      query = query.eq("provider_order_id", token);
    }

    const { data: order, error: orderErr } = await query.maybeSingle();

    if (orderErr || !order) {
      return NextResponse.json({ error: "Verification session not found or link has expired." }, { status: 404 });
    }

    const providerOrderId = order.provider_order_id;
    const details = (order.details as Record<string, any>) || {};
    const createdAtMs = new Date(order.created_at).getTime();
    const expiryWindowMs = 20 * 60 * 1000; // 20 minutes default 5sim window
    const nowMs = Date.now();
    const remainingSeconds = Math.max(0, Math.floor((createdAtMs + expiryWindowMs - nowMs) / 1000));

    // 2. If order is already completed, return cached OTP
    if (order.status === "completed" && order.otp_code) {
      return NextResponse.json({
        success: true,
        phone: order.target,
        service: order.service_name,
        status: "RECEIVED",
        code: order.otp_code,
        smsText: details.sms_text || (details.sms && details.sms[0]?.text) || null,
        expiresInSeconds: 0,
        createdAt: order.created_at,
      });
    }

    // 3. If canceled or refunded
    if (order.status === "canceled" || order.status === "refunded") {
      return NextResponse.json({
        success: true,
        phone: order.target,
        service: order.service_name,
        status: "CANCELED",
        code: null,
        smsText: null,
        expiresInSeconds: 0,
        createdAt: order.created_at,
      });
    }

    // 4. If order is still pending, query live status from 5SIM provider
    if (providerOrderId) {
      try {
        const checkResult = await FiveSimService.checkOrder(providerOrderId);

        // SMS RECEIVED!
        if (checkResult.status === "RECEIVED" && checkResult.sms && checkResult.sms.length > 0) {
          const latestSms = checkResult.sms[checkResult.sms.length - 1];

          await supabaseAdmin
            .from("orders")
            .update({
              status: "completed",
              otp_code: latestSms.code,
              details: {
                ...details,
                ...checkResult,
                sms_text: latestSms.text,
              },
              updated_at: new Date().toISOString(),
            })
            .eq("id", order.id);

          return NextResponse.json({
            success: true,
            phone: order.target,
            service: order.service_name,
            status: "RECEIVED",
            code: latestSms.code,
            smsText: latestSms.text,
            expiresInSeconds: 0,
            createdAt: order.created_at,
          });
        }

        // CANCELED OR TIMED OUT
        if (checkResult.status === "CANCELED" || checkResult.status === "TIMEOUT" || remainingSeconds <= 0) {
          if (order.status !== "refunded") {
            // Auto refund vendor wallet
            const { data: wallet } = await supabaseAdmin
              .from("wallets")
              .select("id, balance")
              .eq("user_id", order.user_id)
              .single();

            if (wallet) {
              const refundBal = Number((Number(wallet.balance) + Number(order.amount_ngn)).toFixed(2));
              await supabaseAdmin
                .from("wallets")
                .update({
                  user_id: order.user_id,
                  balance: refundBal,
                  updated_at: new Date().toISOString()
                })
                .eq("id", wallet.id);

              await supabaseAdmin.from("transactions").insert({
                user_id: order.user_id,
                amount: order.amount_ngn,
                type: "refund",
                status: "completed",
                reference: `REFUND_SMS_${order.id.slice(0, 8)}_${Date.now()}`,
                description: `Auto-refund for expired/canceled SMS line: ${order.service_name}`,
                metadata: { orderId: order.id },
              });
            }

            await supabaseAdmin
              .from("orders")
              .update({
                status: "refunded",
                updated_at: new Date().toISOString(),
              })
              .eq("id", order.id);
          }

          return NextResponse.json({
            success: true,
            phone: order.target,
            service: order.service_name,
            status: "CANCELED",
            code: null,
            smsText: null,
            expiresInSeconds: 0,
            createdAt: order.created_at,
          });
        }
      } catch (pollErr) {
        console.error("Error polling 5sim order from public portal:", pollErr);
      }
    }

    // Still WAITING
    return NextResponse.json({
      success: true,
      phone: order.target,
      service: order.service_name,
      status: "WAITING",
      code: null,
      smsText: null,
      expiresInSeconds: remainingSeconds,
      createdAt: order.created_at,
    });
  } catch (error: any) {
    console.error("Public order API error:", error);
    return NextResponse.json({ error: error.message || "Failed to load verification order" }, { status: 500 });
  }
}

/**
 * POST handler to allow customer/client to cancel a line (e.g. number banned on Telegram/WhatsApp)
 * Instantly triggers 5SIM ban/cancellation and refunds 100% of funds back into the vendor's wallet.
 */
export async function POST(req: Request) {
  try {
    const { token, reason } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Missing verification token" }, { status: 400 });
    }

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token);
    let query = supabaseAdmin
      .from("orders")
      .select("id, user_id, provider_order_id, service_name, target, details, status, amount_ngn")
      .eq("service_type", "sms");

    if (isUUID) {
      query = query.eq("id", token);
    } else {
      query = query.eq("provider_order_id", token);
    }

    const { data: order, error: orderErr } = await query.maybeSingle();

    if (orderErr || !order) {
      return NextResponse.json({ error: "Verification session not found or link has expired." }, { status: 404 });
    }

    if (order.status === "completed") {
      return NextResponse.json({ error: "Verification code was already delivered. Completed orders cannot be canceled." }, { status: 400 });
    }

    if (order.status === "refunded" || order.status === "canceled") {
      return NextResponse.json({ success: true, message: "Line is already canceled and refunded." });
    }

    // 1. Cancel / Ban order on 5SIM
    if (order.provider_order_id) {
      try {
        await FiveSimService.banOrder(order.provider_order_id);
      } catch (e: any) {
        console.warn("5SIM cancel/ban call warning:", e.message);
      }
    }

    // 2. Refund vendor wallet 100%
    const { data: wallet } = await supabaseAdmin
      .from("wallets")
      .select("id, balance")
      .eq("user_id", order.user_id)
      .maybeSingle();

    const refundAmount = Number(order.amount_ngn || 0);

    if (wallet) {
      const newBal = Number((Number(wallet.balance) + refundAmount).toFixed(2));
      await supabaseAdmin
        .from("wallets")
        .update({
          user_id: order.user_id,
          balance: newBal,
          updated_at: new Date().toISOString()
        })
        .eq("id", wallet.id);

      await supabaseAdmin.from("transactions").insert({
        user_id: order.user_id,
        amount: refundAmount,
        type: "refund",
        status: "completed",
        reference: `REF_BANNED_${order.id.slice(0, 8)}_${Date.now()}`,
        description: `Auto-Refund: Customer reported number banned for ${order.service_name} (${order.target})`,
        metadata: {
          order_id: order.id,
          reason: reason || "Customer reported number banned",
          phone: order.target,
        },
      });
    }

    // 3. Update order in database
    await supabaseAdmin
      .from("orders")
      .update({
        status: "refunded",
        details: {
          ...((order.details as Record<string, any>) || {}),
          cancel_reason: reason || "Customer reported number banned on service",
          canceled_at: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    return NextResponse.json({
      success: true,
      message: "Line canceled and full refund returned to vendor's wallet.",
    });
  } catch (err: any) {
    console.error("Public cancel error:", err);
    return NextResponse.json({ error: err.message || "Failed to cancel line" }, { status: 500 });
  }
}
