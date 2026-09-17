import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export interface DisputeItem {
  id: string;
  orderId: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  serviceName: string;
  amount: number;
  reason: string;
  status: "open" | "under_review" | "resolved" | "dismissed";
  resolutionNote: string | null;
  createdAt: string;
}

let runtimeDisputes: DisputeItem[] = [];

export async function GET() {
  return NextResponse.json({
    success: true,
    disputes: runtimeDisputes,
    stats: {
      total: runtimeDisputes.length,
      open: runtimeDisputes.filter((d) => d.status === "open").length,
      underReview: runtimeDisputes.filter((d) => d.status === "under_review").length,
      resolved: runtimeDisputes.filter((d) => d.status === "resolved").length,
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, userId, customerName, customerEmail, serviceName, amount, reason } = body;

    const newDispute: DisputeItem = {
      id: `disp-${Date.now()}`,
      orderId: orderId || "ORD-UNKNOWN",
      userId: userId || "",
      customerName: customerName || "Customer",
      customerEmail: customerEmail || "",
      serviceName: serviceName || "General Service",
      amount: Number(amount || 0),
      reason: reason || "Customer reported issue with delivery",
      status: "open",
      resolutionNote: null,
      createdAt: new Date().toISOString(),
    };

    runtimeDisputes = [newDispute, ...runtimeDisputes];
    return NextResponse.json({ success: true, dispute: newDispute });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { disputeId, status, resolutionNote, refundWallet } = body;

    if (!disputeId || !status) {
      return NextResponse.json({ success: false, error: "Dispute ID and status required" }, { status: 400 });
    }

    const dispute = runtimeDisputes.find((d) => d.id === disputeId);
    if (!dispute) {
      return NextResponse.json({ success: false, error: "Dispute not found" }, { status: 404 });
    }

    if (refundWallet && dispute.userId && dispute.amount > 0 && status === "resolved") {
      // Credit wallet
      const { data: wallet } = await supabaseAdmin
        .from("wallets")
        .select("balance")
        .eq("user_id", dispute.userId)
        .single();

      if (wallet) {
        const newBalance = Number(wallet.balance) + dispute.amount;
        await supabaseAdmin
          .from("wallets")
          .update({ balance: newBalance })
          .eq("user_id", dispute.userId);

        await supabaseAdmin.from("transactions").insert([
          {
            user_id: dispute.userId,
            amount: dispute.amount,
            type: "refund",
            status: "completed",
            reference: `DISP-REF-${Date.now()}`,
            description: `Dispute Resolution Refund: ${dispute.serviceName}`,
          },
        ]);
      }
    }

    runtimeDisputes = runtimeDisputes.map((d) =>
      d.id === disputeId
        ? {
            ...d,
            status,
            resolutionNote: resolutionNote || d.resolutionNote,
          }
        : d
    );

    return NextResponse.json({ success: true, message: `Dispute updated to ${status}` });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
