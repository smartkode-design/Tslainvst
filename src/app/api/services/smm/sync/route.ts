import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { JapService } from "@/lib/providers/jap";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { orderId, userId } = body;

    let query = supabaseAdmin
      .from("orders")
      .select("*")
      .eq("provider", "jap")
      .in("status", ["processing", "pending"]);

    if (orderId) {
      query = query.or(`id.eq.${orderId},provider_order_id.eq.${orderId}`);
    } else if (userId) {
      query = query.eq("user_id", userId);
    } else {
      // Limit to 20 most recent to prevent provider rate limits
      query = query.order("created_at", { ascending: false }).limit(20);
    }

    const { data: orders, error } = await query;
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json({ success: true, synced: 0, message: "No pending SMM orders to sync" });
    }

    const updatedOrders = [];

    for (const ord of orders) {
      if (!ord.provider_order_id) continue;

      try {
        const japStatus = await JapService.getOrderStatus(ord.provider_order_id);
        const rawStatus = (japStatus.status || "").toLowerCase();

        let newStatus = ord.status;
        if (rawStatus === "completed") {
          newStatus = "completed";
        } else if (rawStatus === "canceled" || rawStatus === "cancelled") {
          newStatus = "canceled";
        } else if (rawStatus.includes("progress") || rawStatus.includes("processing")) {
          newStatus = "processing";
        } else if (rawStatus === "partial") {
          newStatus = "partial";
        }

        // Check if status changed or if we need to store live remains / start_count
        const existingDetails = (ord.details as Record<string, any>) || {};
        const isChanged = newStatus !== ord.status || !existingDetails.japStatus;

        if (isChanged || japStatus.remains !== undefined) {
          const updatedDetails = {
            ...existingDetails,
            japStatus,
          };

          // If provider cancelled the order, process auto-refund to user wallet
          if (newStatus === "canceled" && ord.status !== "canceled" && ord.status !== "refunded") {
            const refundAmount = Number(ord.amount_ngn || 0);
            if (refundAmount > 0) {
              const { data: wallet } = await supabaseAdmin
                .from("wallets")
                .select("id, balance")
                .eq("user_id", ord.user_id)
                .single();

              if (wallet) {
                const newBalance = Number(wallet.balance) + refundAmount;
                await supabaseAdmin
                  .from("wallets")
                  .update({ balance: newBalance, updated_at: new Date().toISOString() })
                  .eq("id", wallet.id);

                await supabaseAdmin.from("transactions").insert({
                  user_id: ord.user_id,
                  amount: refundAmount,
                  type: "refund",
                  status: "completed",
                  reference: `REF_SMM_${ord.provider_order_id}_${Date.now()}`,
                  description: `Refund: Canceled SMM Order #${ord.provider_order_id}`,
                  metadata: { orderId: ord.id, providerOrderId: ord.provider_order_id },
                });
              }
            }
          }

          await supabaseAdmin
            .from("orders")
            .update({
              status: newStatus,
              details: updatedDetails,
              updated_at: new Date().toISOString(),
            })
            .eq("id", ord.id);

          updatedOrders.push({
            id: ord.id,
            providerOrderId: ord.provider_order_id,
            oldStatus: ord.status,
            newStatus,
            japStatus,
          });
        }
      } catch (japErr: any) {
        console.warn(`Failed to sync JAP order ${ord.provider_order_id}:`, japErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      synced: updatedOrders.length,
      updatedOrders,
    });
  } catch (err: any) {
    console.error("Error in /api/services/smm/sync:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
