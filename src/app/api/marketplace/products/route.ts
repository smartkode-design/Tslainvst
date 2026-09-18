import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data: logs, error } = await supabaseAdmin
      .from("marketplace_logs")
      .select("id, title, category, description, price_ngn, credentials, status, created_at")
      .eq("status", "available")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching available marketplace logs:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Transform and sanitize: NEVER expose passwords or raw credentials in public catalog
    const products = (logs || []).map((log) => {
      const creds = typeof log.credentials === "object" && log.credentials !== null ? log.credentials : {};
      const platform = creds.platform || log.category.toUpperCase().replace("_", " ");
      const country = creds.country || "United States";
      const flag = creds.flag || "https://flagcdn.com/w640/us.png";
      const priceNum = Number(log.price_ngn || 0);

      return {
        id: log.id,
        title: log.title,
        category: creds.displayCategory || log.category.replace("_", " "),
        platform,
        country,
        flag,
        priceNum,
        price: `₦${new Intl.NumberFormat("en-NG").format(priceNum)}`,
        description: log.description || "",
        stock: 1, // Individual unit in stock
        createdAt: log.created_at,
      };
    });

    return NextResponse.json({
      success: true,
      products,
      count: products.length,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
