import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { DEFAULT_PRICING, PricingItem } from "@/lib/pricing";

export const dynamic = "force-dynamic";

let memoryPricingCache: PricingItem[] = [...DEFAULT_PRICING];

export async function GET() {
  try {
    // Fetch custom pricing overrides from persistent Supabase system config
    const { data: configOrder, error } = await supabaseAdmin
      .from("orders")
      .select("details")
      .eq("provider_order_id", "SYSTEM_PRICING_CONFIG")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && configOrder && configOrder.details) {
      const overrides = configOrder.details as Record<string, any>;
      const merged = DEFAULT_PRICING.map((item) => {
        if (overrides[item.id] !== undefined) {
          return {
            ...item,
            retailNGN: Number(overrides[item.id]),
          };
        }
        return item;
      });
      return NextResponse.json({ success: true, pricing: merged, overrides });
    }

    return NextResponse.json({ success: true, pricing: memoryPricingCache });
  } catch (err: any) {
    console.error("Error fetching pricing:", err);
    return NextResponse.json({ success: true, pricing: memoryPricingCache });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { pricing } = body as { pricing: PricingItem[] };

    if (!pricing || !Array.isArray(pricing)) {
      return NextResponse.json({ error: "Invalid pricing payload" }, { status: 400 });
    }

    // Update in-memory cache
    memoryPricingCache = [...pricing];

    // Build flat overrides dictionary
    const overrides: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    pricing.forEach((p) => {
      overrides[p.id] = Number(p.retailNGN);
    });

    // Persist into Supabase SYSTEM_PRICING_CONFIG record
    const { data: existing } = await supabaseAdmin
      .from("orders")
      .select("id, details")
      .eq("provider_order_id", "SYSTEM_PRICING_CONFIG")
      .limit(1)
      .maybeSingle();

    if (existing) {
      await supabaseAdmin
        .from("orders")
        .update({
          details: { ...existing.details, ...overrides },
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      // Find an admin user to attach record to
      const { data: adminUser } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("role", "admin")
        .limit(1)
        .maybeSingle();

      if (adminUser) {
        await supabaseAdmin.from("orders").insert([
          {
            user_id: adminUser.id,
            service_type: "sms",
            provider: "manual",
            provider_order_id: "SYSTEM_PRICING_CONFIG",
            service_name: "Platform Dynamic Pricing Configuration",
            target: "system",
            quantity: 1,
            amount_ngn: 0,
            cost_usd: 0,
            status: "completed",
            details: overrides,
          },
        ]);
      }
    }

    return NextResponse.json({ success: true, message: "Pricing updated successfully in database", pricing });
  } catch (error: any) {
    console.error("Error updating pricing:", error);
    return NextResponse.json({ error: error.message || "Failed to update pricing" }, { status: 500 });
  }
}
