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
  status: "active" | "out_of_stock" | "disabled";
  createdAt: string;
}

// In-memory catalog that persists during app runtime and syncs with Supabase marketplace_logs
let runtimeProducts: AdminProduct[] = [
  {
    id: "prod-201",
    flag: "https://flagcdn.com/w640/us.png",
    country: "United States",
    stock: 48,
    platform: "GOOGLE VOICE",
    category: "Google Voice",
    title: "Google Voice (+1 USA) Aged 2023 · Clean IP + Gmail + Recovery",
    priceNum: 5500,
    details: "Gmail: gvoice_us992@gmail.com | Pass: Voice!2026Secure | Recovery: recov92@outlook.com | Voice#: +1 (415) 890-4122 | 2FA: JBSWY3DPEHPK3PXP",
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "prod-202",
    flag: "https://flagcdn.com/w640/us.png",
    country: "United States",
    stock: 28,
    platform: "GOOGLE VOICE",
    category: "Google Voice",
    title: "Google Voice (+1 USA Fresh) · High Carrier Trust + Full Access",
    priceNum: 4200,
    details: "Gmail: gv_fresh01@gmail.com | Pass: Fresh!Voice2026 | Recovery: fresh_rec@outlook.com | Voice#: +1 (646) 773-8910",
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "prod-101",
    flag: "https://flagcdn.com/w640/us.png",
    country: "United States",
    stock: 82,
    platform: "FACEBOOK",
    category: "Aged Social Accounts",
    title: "Facebook Aged 2019 · Active Marketplace + 500+ Friends + Cookies",
    priceNum: 4800,
    details: "UID: 10003892182 | Pass: Fb!Aged2019 | 2FA: K4NZ 9XLM 2P3Q 7YTZ | Email Access Included",
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "prod-102",
    flag: "https://flagcdn.com/w640/gb.png",
    country: "United Kingdom",
    stock: 64,
    platform: "INSTAGRAM",
    category: "Aged Social Accounts",
    title: "Instagram Aged 2021 (UK IP) · 1.2k Followers · Organic Activity",
    priceNum: 6200,
    details: "User: @uk_trends_ltd | Pass: InstaSecure!2021 | Email: uk_trends@mail.com",
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "prod-103",
    flag: "https://flagcdn.com/w640/us.png",
    country: "United States",
    stock: 35,
    platform: "TWITTER",
    category: "Aged Social Accounts",
    title: "Twitter / X Aged 2020 · Crypto / Tech Niche · High Karma",
    priceNum: 7500,
    details: "User: @techpulse_x | Pass: Twitter!X2026 | Auth Token: 9812739487123984",
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "prod-104",
    flag: "https://flagcdn.com/w640/us.png",
    country: "United States",
    stock: 120,
    platform: "OPENAI",
    category: "AI Accounts",
    title: "ChatGPT Plus (GPT-4o & o1 Access) · 1-Month Private Account",
    priceNum: 4500,
    details: "Email: gpt_pro_user41@ai-access.net | Pass: OpenAi!Super2026 | Dedicated Profile",
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "prod-105",
    flag: "https://flagcdn.com/w640/pa.png",
    country: "Panama",
    stock: 90,
    platform: "NORDVPN",
    category: "VPNs & Proxies",
    title: "NordVPN Ultimate 1-Year Premium · 6 Devices Simultaneous",
    priceNum: 3800,
    details: "User: nord_vip_user88@proton.me | Pass: NordSafe!887 | Expiry: March 2027",
    status: "active",
    createdAt: new Date().toISOString(),
  },
];

export async function GET() {
  try {
    const { data: dbLogs, error } = await supabaseAdmin
      .from("marketplace_logs")
      .select("*")
      .order("created_at", { ascending: false });

    let combined = [...runtimeProducts];

    if (!error && dbLogs && dbLogs.length > 0) {
      const dbProducts: AdminProduct[] = dbLogs.map((log) => ({
        id: log.id,
        title: log.title,
        category: log.category,
        country: "Global",
        flag: "https://flagcdn.com/w640/us.png",
        stock: log.status === "available" ? 1 : 0,
        platform: log.category.toUpperCase(),
        priceNum: Number(log.price_ngn || 0),
        details: typeof log.credentials === "string" ? log.credentials : JSON.stringify(log.credentials),
        status: log.status === "available" ? "active" : "out_of_stock",
        createdAt: log.created_at,
      }));

      combined = [...dbProducts, ...runtimeProducts];
    }

    return NextResponse.json({
      success: true,
      products: combined,
      stats: {
        total: combined.length,
        inStock: combined.filter((p) => p.stock > 0 && p.status === "active").length,
        outOfStock: combined.filter((p) => p.stock <= 0 || p.status === "out_of_stock").length,
        totalInventoryValue: combined.reduce((acc, p) => acc + p.priceNum * p.stock, 0),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, category, priceNum, stock, platform, country, flag, details } = body;

    if (!title || !priceNum) {
      return NextResponse.json({ success: false, error: "Title and price are required" }, { status: 400 });
    }

    const newProduct: AdminProduct = {
      id: `prod-${Date.now()}`,
      title,
      category: category || "General",
      country: country || "United States",
      flag: flag || "https://flagcdn.com/w640/us.png",
      stock: Number(stock) || 1,
      platform: platform || "MARKETPLACE",
      priceNum: Number(priceNum),
      details: details || "Standard automated instant delivery credentials",
      status: Number(stock) > 0 ? "active" : "out_of_stock",
      createdAt: new Date().toISOString(),
    };

    runtimeProducts = [newProduct, ...runtimeProducts];

    try {
      await supabaseAdmin.from("marketplace_logs").insert([
        {
          category: (category || "other").toLowerCase().replace(/\s+/g, "_"),
          title,
          description: details || "",
          price_ngn: Number(priceNum),
          credentials: { note: details || "" },
          status: "available",
        },
      ]);
    } catch {
      // Non-fatal if schema mismatch
    }

    return NextResponse.json({ success: true, product: newProduct });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, priceNum, stock, status, title } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Product ID required" }, { status: 400 });
    }

    let updated = false;
    runtimeProducts = runtimeProducts.map((p) => {
      if (p.id === id) {
        updated = true;
        return {
          ...p,
          priceNum: priceNum !== undefined ? Number(priceNum) : p.priceNum,
          stock: stock !== undefined ? Number(stock) : p.stock,
          status: status !== undefined ? status : p.status,
          title: title !== undefined ? title : p.title,
        };
      }
      return p;
    });

    if (id.includes("-") && id.length === 36) {
      try {
        await supabaseAdmin
          .from("marketplace_logs")
          .update({
            price_ngn: priceNum !== undefined ? Number(priceNum) : undefined,
            status: status === "active" ? "available" : "reserved",
          })
          .eq("id", id);
      } catch {}
    }

    return NextResponse.json({ success: true, updated });
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

    runtimeProducts = runtimeProducts.filter((p) => p.id !== id);

    if (id.includes("-") && id.length === 36) {
      try {
        await supabaseAdmin.from("marketplace_logs").delete().eq("id", id);
      } catch {}
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
