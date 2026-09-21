import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { JapService, CURATED_SMM_CATALOG } from "@/lib/providers/jap";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { serviceId, link, quantity: rawQuantity } = body;

    // 1. Authenticate caller (verify JWT bearer token if present, fallback to body.userId)
    let authenticatedUserId: string | null = null;
    const authHeader = req.headers.get("authorization");
    
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
      if (user && !error) {
        authenticatedUserId = user.id;
      }
    }

    if (!authenticatedUserId && body.userId) {
      const { data: verifiedProfile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("id", body.userId)
        .single();

      if (verifiedProfile) {
        authenticatedUserId = verifiedProfile.id;
      }
    }

    if (!authenticatedUserId) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    if (!serviceId || !link || !rawQuantity) {
      return NextResponse.json({ error: "Missing required fields (serviceId, link, quantity)" }, { status: 400 });
    }

    const quantity = Math.floor(Number(rawQuantity));
    if (isNaN(quantity) || quantity <= 0) {
      return NextResponse.json({ error: "Invalid quantity provided" }, { status: 400 });
    }

    // 2. Find service in curated catalog
    const service = CURATED_SMM_CATALOG.find(
      (s) => s.id === serviceId || s.japServiceId === Number(serviceId)
    );
    if (!service) {
      return NextResponse.json({ error: "Invalid or unsupported service selected" }, { status: 400 });
    }

    if (quantity < service.minQuantity || quantity > service.maxQuantity) {
      return NextResponse.json(
        { error: `Quantity must be between ${service.minQuantity.toLocaleString()} and ${service.maxQuantity.toLocaleString()}` },
        { status: 400 }
      );
    }

    // 3. Authoritative server price calculation (NEVER trust client calculations)
    let unitRateNGN = service.retailPriceNGN;
    try {
      const { data: configOrder } = await supabaseAdmin
        .from("orders")
        .select("details")
        .eq("provider_order_id", "SYSTEM_PRICING_CONFIG")
        .limit(1)
        .maybeSingle();

      const overrides = (configOrder?.details as Record<string, any>) || {};
      if (overrides[service.id]) {
        unitRateNGN = Number(overrides[service.id]);
      }
    } catch {
      // Use standard catalog rate
    }

    const totalCostNGN = Math.round((quantity / 1000) * unitRateNGN);
    const estimatedWholesaleCostUSD = Number(((quantity / 1000) * service.wholesaleCostUSD).toFixed(4));

    if (totalCostNGN <= 0) {
      return NextResponse.json({ error: "Invalid price calculation" }, { status: 400 });
    }

    // 4. Verify user wallet balance
    const { data: wallet, error: walletErr } = await supabaseAdmin
      .from("wallets")
      .select("id, balance")
      .eq("user_id", authenticatedUserId)
      .single();

    if (walletErr || !wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    const currentBalance = Number(wallet.balance);
    if (currentBalance < totalCostNGN) {
      return NextResponse.json(
        { error: `Insufficient wallet balance. Required: ₦${totalCostNGN.toLocaleString()}, Available: ₦${currentBalance.toLocaleString()}` },
        { status: 400 }
      );
    }

    // 5. Atomic debit with write-time balance guard (.gte)
    const newBalance = Number((currentBalance - totalCostNGN).toFixed(2));
    const { error: debitErr } = await supabaseAdmin
      .from("wallets")
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq("id", wallet.id)
      .gte("balance", totalCostNGN);

    if (debitErr) {
      return NextResponse.json(
        { error: "Concurrent transaction conflict. Please try again." },
        { status: 409 }
      );
    }

    // 6. Call JAP SMM API
    let japOrder;
    try {
      japOrder = await JapService.createOrder(service.japServiceId, link, quantity);
    } catch (apiError: any) {
      // Rollback user wallet if provider fails!
      console.error("JAP API call failed, rolling back wallet balance:", apiError);
      await supabaseAdmin
        .from("wallets")
        .update({ balance: currentBalance, updated_at: new Date().toISOString() })
        .eq("id", wallet.id);

      const rawMsg = String(apiError?.message || "");
      let userFriendlyMessage = "This boost service is temporarily undergoing routine maintenance. Please try another package or check back shortly.";

      if (rawMsg.toLowerCase().includes("link") || rawMsg.toLowerCase().includes("url")) {
        userFriendlyMessage = "The target link provided appears to be invalid or private. Please check the URL and ensure the profile is public.";
      } else if (rawMsg.toLowerCase().includes("quantity") || rawMsg.toLowerCase().includes("min") || rawMsg.toLowerCase().includes("max")) {
        userFriendlyMessage = "Order quantity must adhere to the service limits for this package.";
      }

      return NextResponse.json(
        { error: userFriendlyMessage },
        { status: 502 }
      );
    }

    // 7. Record transaction audit log
    await supabaseAdmin.from("transactions").insert({
      user_id: authenticatedUserId,
      amount: totalCostNGN,
      type: "purchase",
      status: "completed",
      reference: `SMM_${japOrder.order}_${Date.now()}`,
      description: `Boost: ${quantity.toLocaleString()} ${service.name}`,
      metadata: { orderId: japOrder.order, link, serviceId: service.japServiceId, quantity },
    });

    // 8. Record order
    const { data: orderRecord } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: authenticatedUserId,
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
