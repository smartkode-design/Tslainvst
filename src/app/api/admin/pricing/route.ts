import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { DEFAULT_PRICING, PricingItem } from "@/lib/pricing";

// In-memory runtime cache fallback
let memoryPricingCache: PricingItem[] = [...DEFAULT_PRICING];

export async function GET() {
  try {
    // Try fetching custom overrides from Supabase
    const { data: dbPricing, error } = await supabaseAdmin
      .from("service_pricing")
      .select("*");

    if (!error && dbPricing && dbPricing.length > 0) {
      // Merge DB values with defaults
      const merged = DEFAULT_PRICING.map((item) => {
        const override = dbPricing.find((p: any) => p.id === item.id);
        if (override) {
          return {
            ...item,
            retailNGN: Number(override.retail_price_ngn),
            active: override.is_active !== undefined ? override.is_active : item.active,
          };
        }
        return item;
      });
      return NextResponse.json({ success: true, pricing: merged });
    }

    return NextResponse.json({ success: true, pricing: memoryPricingCache });
  } catch (err: any) {
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

    // Try persisting to Supabase if table exists
    try {
      const upsertRows = pricing.map((p) => ({
        id: p.id,
        service_type: p.category,
        name: p.name,
        retail_price_ngn: p.retailNGN,
        is_active: p.active,
        updated_at: new Date().toISOString(),
      }));

      await supabaseAdmin.from("service_pricing").upsert(upsertRows, { onConflict: "id" });
    } catch (dbErr) {
      // Silent catch if table isn't created yet; memory cache holds the live state
      console.warn("Supabase service_pricing upsert fallback:", dbErr);
    }

    return NextResponse.json({ success: true, message: "Pricing updated successfully", pricing });
  } catch (error: any) {
    console.error("Error updating pricing:", error);
    return NextResponse.json({ error: error.message || "Failed to update pricing" }, { status: 500 });
  }
}
