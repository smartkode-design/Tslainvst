import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { FiveSimService } from "@/lib/providers/fivesim";
import { DEFAULT_PRICING, calculateSmsPrice, isServiceSupportedInCountry } from "@/lib/pricing";

export const dynamic = "force-dynamic";

// Calculate authoritative server price
function getAuthoritativePrice(country: string, service: string): number {
  return calculateSmsPrice(service, country);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { country = "us", service = "whatsapp" } = body;

    // Validate country availability for service
    if (!isServiceSupportedInCountry(service, country)) {
      return NextResponse.json(
        { error: `${service} is not available in the selected country (${country.toUpperCase()}). Please select a supported route (e.g. United States +1).` },
        { status: 400 }
      );
    }

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
      // Verify userId exists in profiles
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

    // 2. Compute authoritative price strictly on the server (never trust client retailPrice)
    const authoritativePrice = getAuthoritativePrice(country, service);

    // 3. Check user wallet balance
    const { data: wallet, error: walletErr } = await supabaseAdmin
      .from("wallets")
      .select("id, balance")
      .eq("user_id", authenticatedUserId)
      .single();

    if (walletErr || !wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    const currentBalance = Number(wallet.balance);
    if (currentBalance < authoritativePrice) {
      return NextResponse.json(
        { error: `Insufficient wallet balance. Required: ₦${authoritativePrice.toLocaleString()}, Available: ₦${currentBalance.toLocaleString()}` },
        { status: 400 }
      );
    }

    // 4. Atomic debit: Ensure balance is still >= authoritativePrice at write time
    const newBalance = Number((currentBalance - authoritativePrice).toFixed(2));
    const { error: debitErr } = await supabaseAdmin
      .from("wallets")
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq("id", wallet.id)
      .gte("balance", authoritativePrice);

    if (debitErr) {
      return NextResponse.json(
        { error: "Concurrent transaction conflict. Please try again." },
        { status: 409 }
      );
    }

    // 5. Call 5SIM API to acquire number
    let fiveSimOrder;
    try {
      fiveSimOrder = await FiveSimService.buyNumber(country, "any", service);
    } catch (apiError: any) {
      // CRITICAL: Rollback user wallet if provider fails!
      console.error("5SIM API call failed, rolling back wallet balance:", apiError);
      await supabaseAdmin
        .from("wallets")
        .update({ balance: currentBalance, updated_at: new Date().toISOString() })
        .eq("id", wallet.id);

      return NextResponse.json(
        { error: `Provider error: ${apiError.message || "Failed to allocate phone number"}` },
        { status: 502 }
      );
    }

    // 6. Record transaction audit
    await supabaseAdmin.from("transactions").insert({
      user_id: authenticatedUserId,
      amount: authoritativePrice,
      type: "purchase",
      status: "completed",
      reference: `SMS_${fiveSimOrder.id}_${Date.now()}`,
      description: `Purchased ${country.toUpperCase()} ${service.toUpperCase()} Virtual Line`,
      metadata: { orderId: fiveSimOrder.id, phone: fiveSimOrder.phone, priceNGN: authoritativePrice },
    });

    // 7. Create order record
    const { data: orderRecord } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: authenticatedUserId,
        service_type: "sms",
        provider: "5sim",
        provider_order_id: String(fiveSimOrder.id),
        service_name: `${country.toUpperCase()} ${service.toUpperCase()}`,
        target: fiveSimOrder.phone,
        amount_ngn: authoritativePrice,
        cost_usd: fiveSimOrder.price,
        status: "pending",
        details: fiveSimOrder,
      })
      .select("id")
      .single();

    return NextResponse.json({
      success: true,
      orderId: fiveSimOrder.id,
      systemOrderId: orderRecord?.id,
      phone: fiveSimOrder.phone,
      expires: fiveSimOrder.expires,
      chargedAmount: authoritativePrice,
      newBalance,
    });
  } catch (error: any) {
    console.error("Error in /api/services/sms/buy:", error);
    return NextResponse.json({ error: error.message || "Failed to buy SMS number" }, { status: 500 });
  }
}
