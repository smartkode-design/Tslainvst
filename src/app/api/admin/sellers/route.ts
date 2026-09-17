import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data: profiles, error } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, email, role, phone, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Filter sellers or provide all users with seller role tags
    const sellers = (profiles || [])
      .filter((p) => p.role === "seller")
      .map((s) => ({
        id: s.id,
        storeName: s.full_name ? `${s.full_name}'s Store` : "Merchant Store",
        merchantName: s.full_name || s.email?.split("@")[0] || "Seller",
        email: s.email,
        phone: s.phone || "—",
        activeProducts: 0,
        totalSales: "₦0.00",
        status: "Verified Merchant",
        joined: new Date(s.created_at).toLocaleDateString("en-NG", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      }));

    // Candidate users who can be promoted to seller
    const candidates = (profiles || []).map((p) => ({
      id: p.id,
      name: p.full_name || p.email?.split("@")[0] || "User",
      email: p.email,
      role: p.role,
    }));

    return NextResponse.json({ success: true, sellers, candidates });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json({ error: "Missing userId or role" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .update({ role, updated_at: new Date().toISOString() })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, profile: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
