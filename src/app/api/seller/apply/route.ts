import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// GET: Check user's own application status
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Verify user exists
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, role")
      .eq("id", userId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If already a seller or admin, return that status
    if (profile.role === "seller" || profile.role === "admin") {
      return NextResponse.json({ success: true, isSeller: true, application: null });
    }

    // Check for existing application
    const { data: application } = await supabaseAdmin
      .from("seller_applications")
      .select("id, status, reason, created_at, admin_note")
      .eq("user_id", userId)
      .maybeSingle();

    return NextResponse.json({ success: true, isSeller: false, application });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Submit a seller application
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, fullName, email, reason, socialHandles } = body;

    if (!userId || !reason) {
      return NextResponse.json({ error: "Missing userId or reason" }, { status: 400 });
    }

    // Verify user exists
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, role, full_name, email")
      .eq("id", userId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (profile.role === "seller") {
      return NextResponse.json({ error: "You are already a seller" }, { status: 400 });
    }

    // Upsert application (update if already exists)
    const { data, error } = await supabaseAdmin
      .from("seller_applications")
      .upsert(
        {
          user_id: userId,
          full_name: fullName || profile.full_name,
          email: email || profile.email,
          reason: reason.trim(),
          social_handles: socialHandles?.trim() || null,
          status: "pending",
        },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, application: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
