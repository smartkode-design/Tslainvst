import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export interface AdminProduct {
  id: string;
  title: string;
  category: string;
  country: string;
  flag: string;
  stock: number;
  platform: string;
  priceNum: number;
  details: string;
  status: "active" | "out_of_stock" | "sold" | "disabled";
  createdAt: string;
}

function mapCategoryToDb(cat: string): "facebook" | "instagram" | "twitter" | "linkedin" | "google_voice" | "gmail" | "other" {
  const c = cat.toLowerCase();
  if (c.includes("voice")) return "google_voice";
  if (c.includes("facebook")) return "facebook";
  if (c.includes("instagram")) return "instagram";
  if (c.includes("twitter") || c.includes("x")) return "twitter";
  if (c.includes("linkedin")) return "linkedin";
  if (c.includes("gmail") || c.includes("google")) return "gmail";
  return "other";
}

export async function GET() {
  try {
    const { data: dbLogs, error } = await supabaseAdmin
      .from("marketplace_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching marketplace_logs:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const products: AdminProduct[] = (dbLogs || []).map((log) => {
      const creds = typeof log.credentials === "object" && log.credentials !== null ? log.credentials : {};
      const platform = creds.platform || log.category.toUpperCase().replace("_", " ");
      const country = creds.country || "United States";
      const flag = creds.flag || "https://flagcdn.com/w640/us.png";

      let detailsStr = "";
      if (typeof log.credentials === "string") {
        detailsStr = log.credentials;
      } else {
        const parts: string[] = [];
        if (creds.username) parts.push(`User: ${creds.username}`);
        if (creds.password) parts.push(`Pass: ${creds.password}`);
        if (creds.two_factor) parts.push(`2FA: ${creds.two_factor}`);
        if (creds.recovery_email) parts.push(`Recovery: ${creds.recovery_email}`);
        if (creds.phone) parts.push(`Phone: ${creds.phone}`);
        if (creds.notes) parts.push(`Notes: ${creds.notes}`);
        detailsStr = parts.length > 0 ? parts.join(" | ") : JSON.stringify(creds);
      }

      return {
        id: log.id,
        title: log.title,
        category: creds.displayCategory || log.category.replace("_", " ").toUpperCase(),
        country,
        flag,
        stock: log.status === "available" ? 1 : 0,
        platform,
        priceNum: Number(log.price_ngn || 0),
        details: detailsStr,
        status: log.status === "available" ? "active" : "sold",
        createdAt: log.created_at,
      };
    });

    return NextResponse.json({
      success: true,
      products,
      stats: {
        total: products.length,
        inStock: products.filter((p) => p.status === "active").length,
        sold: products.filter((p) => p.status === "sold").length,
        totalInventoryValue: products
          .filter((p) => p.status === "active")
          .reduce((acc, p) => acc + p.priceNum, 0),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, category, priceNum, platform, country, flag, details, username, password, twoFactor, recoveryEmail, notes } = body;

    if (!title || !priceNum) {
      return NextResponse.json({ success: false, error: "Title and price are required" }, { status: 400 });
    }

    const dbCategory = mapCategoryToDb(category || platform || "other");

    // Build credentials object
    const credentialsObj = {
      username: username || "",
      password: password || "",
      two_factor: twoFactor || "",
      recovery_email: recoveryEmail || "",
      notes: notes || details || "",
      platform: platform || category || "MARKETPLACE",
      country: country || "United States",
      flag: flag || "https://flagcdn.com/w640/us.png",
      displayCategory: category || platform || "General",
    };

    const { data: inserted, error: insertErr } = await supabaseAdmin
      .from("marketplace_logs")
      .insert([
        {
          category: dbCategory,
          title: title.trim(),
          description: details || notes || "",
          price_ngn: Number(priceNum),
          credentials: credentialsObj,
          status: "available",
        },
      ])
      .select()
      .single();

    if (insertErr) {
      console.error("Supabase insert error in admin products:", insertErr);
      return NextResponse.json({ success: false, error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      product: {
        id: inserted.id,
        title: inserted.title,
        priceNum: Number(inserted.price_ngn),
        category: credentialsObj.displayCategory,
        status: "active",
        stock: 1,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, priceNum, status, title } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Log ID required" }, { status: 400 });
    }

    const updates: Record<string, any> = {};
    if (priceNum !== undefined) updates.price_ngn = Number(priceNum);
    if (title !== undefined) updates.title = title;
    if (status !== undefined) {
      updates.status = status === "active" ? "available" : "sold";
    }

    const { error: updateErr } = await supabaseAdmin
      .from("marketplace_logs")
      .update(updates)
      .eq("id", id);

    if (updateErr) {
      return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Product ID required" }, { status: 400 });
    }

    const { error: delErr } = await supabaseAdmin
      .from("marketplace_logs")
      .delete()
      .eq("id", id);

    if (delErr) {
      return NextResponse.json({ success: false, error: delErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
