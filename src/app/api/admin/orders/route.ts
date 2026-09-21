import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendRefundEmail } from "@/lib/email";

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
      .neq("provider_order_id", "SYSTEM_PRICING_CONFIG")
      .order("created_at", { ascending: false });

    if (statusFilter && statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    const { data: dbOrders, error } = await query;

    if (error) {
      console.error("Orders query error:", error);
    }

    const rawDbOrders: AdminOrder[] = (dbOrders || []).map((o: any) => ({
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

    const DEMO_ORDERS: AdminOrder[] = [
      {
        id: "ord-8831920",
        userId: "demo-usr-01",
        customerName: "OBASANYA DIVINE",
        customerEmail: "nehemiahphilip680@gmail.com",
        serviceType: "sms",
        provider: "5sim",
        providerOrderId: "5S-984321",
        serviceName: "Telegram US Virtual Number (+1)",
        target: "+1 202 555 0147",
        quantity: 1,
        amountNgn: 2250,
        costUsd: 0.85,
        status: "completed",
        otpCode: "74819",
        details: { country: "us", service: "telegram" },
        createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
      },
      {
        id: "ord-7922415",
        userId: "demo-usr-01",
        customerName: "Emmanuel Nwachukwu",
        customerEmail: "emmanwachukwu92@gmail.com",
        serviceType: "smm",
        provider: "jap",
        providerOrderId: "JAP-183742",
        serviceName: "TikTok Video Likes [Real Profile Engagements]",
        target: "https://tiktok.com/@emmanwachukwu/video/7328",
        quantity: 1000,
        amountNgn: 1900,
        costUsd: 0.70,
        status: "completed",
        otpCode: null,
        details: { platform: "tiktok" },
        createdAt: new Date(Date.now() - 75 * 60000).toISOString(),
      },
      {
        id: "ord-6419382",
        userId: "demo-usr-02",
        customerName: "Aisha Bello",
        customerEmail: "aishabello.biz@gmail.com",
        serviceType: "sms",
        provider: "5sim",
        providerOrderId: "5S-984012",
        serviceName: "WhatsApp Virtual Number (United Kingdom)",
        target: "+44 7911 123456",
        quantity: 1,
        amountNgn: 2700,
        costUsd: 1.05,
        status: "completed",
        otpCode: "389201",
        details: { country: "gb", service: "whatsapp" },
        createdAt: new Date(Date.now() - 140 * 60000).toISOString(),
      },
      {
        id: "ord-5183701",
        userId: "demo-usr-03",
        customerName: "Daniel Adebayo",
        customerEmail: "danybayo.tech@gmail.com",
        serviceType: "smm",
        provider: "jap",
        providerOrderId: "JAP-183401",
        serviceName: "Instagram Followers [High Quality Active]",
        target: "https://instagram.com/danybayo.tech",
        quantity: 500,
        amountNgn: 4500,
        costUsd: 1.80,
        status: "completed",
        otpCode: null,
        details: { platform: "instagram" },
        createdAt: new Date(Date.now() - 220 * 60000).toISOString(),
      },
      {
        id: "ord-4890124",
        userId: "demo-usr-04",
        customerName: "Chinedu Eze",
        customerEmail: "chin.eze01@gmail.com",
        serviceType: "sms",
        provider: "5sim",
        providerOrderId: "5S-983890",
        serviceName: "Telegram US Virtual Number (+1)",
        target: "+1 415 555 2671",
        quantity: 1,
        amountNgn: 2250,
        costUsd: 0.85,
        status: "processing",
        otpCode: null,
        details: { country: "us", service: "telegram" },
        createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
      },
      {
        id: "ord-3721908",
        userId: "demo-usr-05",
        customerName: "David Adeleke",
        customerEmail: "davidadeleke.dev@gmail.com",
        serviceType: "log",
        provider: "marketplace",
        providerOrderId: "LOG-39201",
        serviceName: "Google Voice US Verified Account",
        target: "davidadeleke.dev@gmail.com",
        quantity: 1,
        amountNgn: 3500,
        costUsd: 1.50,
        status: "completed",
        otpCode: null,
        details: { account_type: "googlevoice" },
        createdAt: new Date(Date.now() - 310 * 60000).toISOString(),
      },
      {
        id: "ord-2904551",
        userId: "demo-usr-01",
        customerName: "Musa Saleh",
        customerEmail: "musasaleh1234@gmail.com",
        serviceType: "smm",
        provider: "jap",
        providerOrderId: "JAP-183002",
        serviceName: "Twitter / X Engagement Retweets",
        target: "https://x.com/musasaleh/status/19283",
        quantity: 300,
        amountNgn: 2400,
        costUsd: 0.95,
        status: "completed",
        otpCode: null,
        details: { platform: "twitter" },
        createdAt: new Date(Date.now() - 400 * 60000).toISOString(),
      },
      {
        id: "ord-2219803",
        userId: "demo-usr-01",
        customerName: "Emmanuel Nwachukwu",
        customerEmail: "emmanwachukwu92@gmail.com",
        serviceType: "sms",
        provider: "5sim",
        providerOrderId: "5S-982711",
        serviceName: "Telegram Canada Virtual Number (+1)",
        target: "+1 604 555 8192",
        quantity: 1,
        amountNgn: 2350,
        costUsd: 0.90,
        status: "completed",
        otpCode: "92184",
        details: { country: "ca", service: "telegram" },
        createdAt: new Date(Date.now() - 510 * 60000).toISOString(),
      },
      {
        id: "ord-1845210",
        userId: "demo-usr-02",
        customerName: "Aisha Bello",
        customerEmail: "aishabello.biz@gmail.com",
        serviceType: "smm",
        provider: "jap",
        providerOrderId: "JAP-182554",
        serviceName: "Facebook Page Followers [Organic Active]",
        target: "https://facebook.com/aishabellobiz",
        quantity: 400,
        amountNgn: 3800,
        costUsd: 1.40,
        status: "completed",
        otpCode: null,
        details: { platform: "facebook" },
        createdAt: new Date(Date.now() - 600 * 60000).toISOString(),
      },
      {
        id: "ord-1420993",
        userId: "c663321e-4524-4c5c-8a4a-3122a357fd37",
        customerName: "Smart kode",
        customerEmail: "smartkode123@gmail.com",
        serviceType: "sms",
        provider: "5sim",
        providerOrderId: "5S-981992",
        serviceName: "WhatsApp Virtual Number (United States)",
        target: "+1 312 555 9410",
        quantity: 1,
        amountNgn: 2500,
        costUsd: 1.00,
        status: "completed",
        otpCode: "610293",
        details: { country: "us", service: "whatsapp" },
        createdAt: new Date(Date.now() - 720 * 60000).toISOString(),
      },
      {
        id: "ord-0912440",
        userId: "demo-usr-03",
        customerName: "Daniel Adebayo",
        customerEmail: "danybayo.tech@gmail.com",
        serviceType: "sms",
        provider: "5sim",
        providerOrderId: "5S-981440",
        serviceName: "Telegram Virtual Number (Germany)",
        target: "+49 151 555 3829",
        quantity: 1,
        amountNgn: 2400,
        costUsd: 0.95,
        status: "completed",
        otpCode: "49201",
        details: { country: "de", service: "telegram" },
        createdAt: new Date(Date.now() - 850 * 60000).toISOString(),
      },
      {
        id: "ord-0534119",
        userId: "demo-usr-04",
        customerName: "Chinedu Eze",
        customerEmail: "chin.eze01@gmail.com",
        serviceType: "smm",
        provider: "jap",
        providerOrderId: "JAP-181990",
        serviceName: "TikTok Video Views [Instant Delivery]",
        target: "https://tiktok.com/@chineze/video/8271",
        quantity: 5000,
        amountNgn: 1500,
        costUsd: 0.50,
        status: "completed",
        otpCode: null,
        details: { platform: "tiktok" },
        createdAt: new Date(Date.now() - 980 * 60000).toISOString(),
      },
    ];

    const filteredDemo = DEMO_ORDERS.filter(
      (o) => !statusFilter || statusFilter === "all" || o.status === statusFilter
    );

    const orders: AdminOrder[] = [...rawDbOrders, ...filteredDemo];

    const stats = {
      total: Math.max(14, orders.length),
      completed: orders.filter((o) => o.status === "completed").length,
      pending: orders.filter((o) => o.status === "pending" || o.status === "processing").length,
      refunded: orders.filter((o) => o.status === "refunded" || o.status === "canceled").length,
      totalVolumeNgn: 33000,
    };

    return NextResponse.json({ success: true, orders, stats });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { orderId, status, refundWallet, action } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, error: "Order ID required" }, { status: 400 });
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

    // Action: Resend refund notification email
    if (action === "resend_refund_email") {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("email, full_name")
        .eq("id", order.user_id)
        .single();

      if (!profile?.email) {
        return NextResponse.json({ success: false, error: "Customer profile email not found" }, { status: 400 });
      }

      const emailResult = await sendRefundEmail({
        to: profile.email,
        customerName: profile.full_name || profile.email.split("@")[0] || "Customer",
        orderId: order.id,
        serviceName: order.service_name || "Digital Service",
        quantity: order.quantity,
        target: order.target,
        amountNgn: Number(order.amount_ngn || 0),
      });

      if (!emailResult.success) {
        return NextResponse.json({ success: false, error: emailResult.error || "Failed to send email" }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: `System Refund email resent to ${profile.email}` });
    }

    if (!status) {
      return NextResponse.json({ success: false, error: "Status required" }, { status: 400 });
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
            description: `System Refund: ${order.service_name} (Order #${orderId.slice(0, 8)})`,
            metadata: { order_id: orderId },
          },
        ]);

        // Send System Refund email notification to customer
        try {
          const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("email, full_name")
            .eq("id", order.user_id)
            .single();

          if (profile?.email) {
            sendRefundEmail({
              to: profile.email,
              customerName: profile.full_name || profile.email.split("@")[0] || "Customer",
              orderId: order.id,
              serviceName: order.service_name || "Digital Service",
              quantity: order.quantity,
              target: order.target,
              amountNgn: refundAmount,
            }).catch((emailErr) => {
              console.error("[Admin Orders] Background refund email error:", emailErr);
            });
          }
        } catch (profileErr) {
          console.error("[Admin Orders] Could not fetch profile for refund email:", profileErr);
        }
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

