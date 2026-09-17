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

    const users = (profiles || []).map((p) => ({
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

    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
