import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  itemCount: number;
  status: "active" | "inactive";
  featured: boolean;
  createdAt: string;
}

// System master categories
let runtimeCategories: CategoryItem[] = [
  {
    id: "cat-sms",
    name: "Virtual Numbers (SMS OTP)",
    slug: "virtual-numbers",
    icon: "📱",
    description: "Instant OTP numbers for WhatsApp, Telegram, Signal, Google Voice, OpenAI, Claude across 100+ countries.",
    itemCount: 85,
    status: "active",
    featured: true,
    createdAt: new Date("2026-01-01").toISOString(),
  },
  {
    id: "cat-smm",
    name: "Social Media Boosting (SMM)",
    slug: "social-media-boost",
    icon: "🚀",
    description: "Instant followers, likes, views, and reposts across Instagram, TikTok, Twitter/X, YouTube, Telegram, and Facebook.",
    itemCount: 140,
    status: "active",
    featured: true,
    createdAt: new Date("2026-01-01").toISOString(),
  },
  {
    id: "cat-gv",
    name: "Google Voice Accounts",
    slug: "google-voice",
    icon: "📞",
    description: "Verified USA Google Voice (+1) numbers, fresh and 2023 aged accounts with complete Gmail + recovery email access.",
    itemCount: 76,
    status: "active",
    featured: true,
    createdAt: new Date("2026-01-01").toISOString(),
  },
  {
    id: "cat-aged",
    name: "Aged Social Accounts & Logs",
    slug: "aged-socials",
    icon: "💎",
    description: "High-trust aged accounts for Facebook (Marketplace enabled), Instagram, Twitter/X, Discord, and Gmail.",
    itemCount: 420,
    status: "active",
    featured: true,
    createdAt: new Date("2026-01-01").toISOString(),
  },
  {
    id: "cat-ai",
    name: "AI & Developer Accounts",
    slug: "ai-accounts",
    icon: "🤖",
    description: "ChatGPT Plus, Claude Pro, Midjourney, and pre-funded OpenAI API platform accounts with full access.",
    itemCount: 95,
    status: "active",
    featured: false,
    createdAt: new Date("2026-01-01").toISOString(),
  },
  {
    id: "cat-vpn",
    name: "VPNs & Residential Proxies",
    slug: "vpns-proxies",
    icon: "🛡️",
    description: "Premium subscriptions for NordVPN, ExpressVPN, Surfshark, and dedicated residential rotating proxies.",
    itemCount: 190,
    status: "active",
    featured: false,
    createdAt: new Date("2026-01-01").toISOString(),
  },
  {
    id: "cat-vtu",
    name: "Airtime & Cheap Data VTU",
    slug: "airtime-data",
    icon: "⚡",
    description: "Automated instant top-up for MTN SME data, Airtel, Glo, and 9mobile at direct wholesale discounts.",
    itemCount: 24,
    status: "active",
    featured: false,
    createdAt: new Date("2026-01-01").toISOString(),
  },
];

export async function GET() {
  return NextResponse.json({
    success: true,
    categories: runtimeCategories,
    total: runtimeCategories.length,
    activeCount: runtimeCategories.filter((c) => c.status === "active").length,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, icon, description, featured } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: "Category name required" }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const newCategory: CategoryItem = {
      id: `cat-${Date.now()}`,
      name,
      slug,
      icon: icon || "📁",
      description: description || "Custom catalog service category",
      itemCount: 0,
      status: "active",
      featured: Boolean(featured),
      createdAt: new Date().toISOString(),
    };

    runtimeCategories = [newCategory, ...runtimeCategories];

    return NextResponse.json({ success: true, category: newCategory });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, name, description, featured } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Category ID required" }, { status: 400 });
    }

    let updated = false;
    runtimeCategories = runtimeCategories.map((c) => {
      if (c.id === id) {
        updated = true;
        return {
          ...c,
          status: status !== undefined ? status : c.status,
          name: name !== undefined ? name : c.name,
          description: description !== undefined ? description : c.description,
          featured: featured !== undefined ? Boolean(featured) : c.featured,
        };
      }
      return c;
    });

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
      return NextResponse.json({ success: false, error: "Category ID required" }, { status: 400 });
    }

    runtimeCategories = runtimeCategories.filter((c) => c.id !== id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
