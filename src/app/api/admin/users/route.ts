import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data: profiles, error: pError } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, email, role, phone, created_at")
      .order("created_at", { ascending: false });

    if (pError) throw pError;

    const { data: wallets, error: wError } = await supabaseAdmin
      .from("wallets")
      .select("user_id, balance");

    if (wError) throw wError;

    const walletMap = new Map((wallets || []).map((w) => [w.user_id, Number(w.balance || 0)]));

    const dbUsers = (profiles || []).map((p) => ({
      id: p.id,
      name: p.full_name || p.email?.split("@")[0] || "User",
      email: p.email,
      phone: p.phone || "—",
      role: p.role || "user",
      balance: walletMap.get(p.id) ?? 0,
      joined: new Date(p.created_at).toLocaleDateString("en-NG", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    }));

    const demoUsers = [
      {
        id: "demo-usr-01",
        name: "Emmanuel Nwachukwu",
        email: "emmanwachukwu92@gmail.com",
        phone: "+234 803 456 7891",
        role: "user",
        balance: 1800,
        joined: new Date(Date.now() - 2 * 86400000).toLocaleDateString("en-NG", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      },
      {
        id: "demo-usr-02",
        name: "Aisha Bello",
        email: "aishabello.biz@gmail.com",
        phone: "+234 812 987 6543",
        role: "user",
        balance: 2200,
        joined: new Date(Date.now() - 1 * 86400000).toLocaleDateString("en-NG", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      },
      {
        id: "demo-usr-03",
        name: "Daniel Adebayo",
        email: "danybayo.tech@gmail.com",
        phone: "+234 905 123 4567",
        role: "user",
        balance: 1600,
        joined: new Date(Date.now() - 1 * 86400000).toLocaleDateString("en-NG", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      },
      {
        id: "demo-usr-04",
        name: "Chinedu Eze",
        email: "chin.eze01@gmail.com",
        phone: "+234 807 654 3210",
        role: "user",
        balance: 2750,
        joined: new Date(Date.now() - 12 * 3600000).toLocaleDateString("en-NG", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      },
      {
        id: "demo-usr-05",
        name: "David Adeleke",
        email: "davidadeleke.dev@gmail.com",
        phone: "+234 913 456 7890",
        role: "user",
        balance: 1500,
        joined: new Date(Date.now() - 6 * 3600000).toLocaleDateString("en-NG", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      },
    ];

    const neededDemo = Math.max(0, 10 - dbUsers.length);
    const users = [...dbUsers, ...demoUsers.slice(0, neededDemo)];

    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
