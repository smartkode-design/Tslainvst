import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { pin, userId: bodyUserId } = body;

    if (!pin || String(pin).trim().length !== 4) {
      return NextResponse.json({ valid: false, error: "Please enter your 4-digit PIN" }, { status: 400 });
    }

    // Authenticate user
    let authenticatedUserId: string | null = null;
    const authHeader = req.headers.get("authorization");

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const {
        data: { user },
        error,
      } = await supabaseAdmin.auth.getUser(token);
      if (user && !error) {
        authenticatedUserId = user.id;
      }
    }

    if (!authenticatedUserId && bodyUserId) {
      authenticatedUserId = bodyUserId;
    }

    if (!authenticatedUserId) {
      return NextResponse.json({ valid: false, error: "Unauthorized. Please log in." }, { status: 401 });
    }

    // Fetch user from Supabase Auth admin
    const { data: userData, error: userErr } = await supabaseAdmin.auth.admin.getUserById(authenticatedUserId);

    if (userErr || !userData?.user) {
      return NextResponse.json({ valid: false, error: "User account not found." }, { status: 404 });
    }

    const storedPin = userData.user.user_metadata?.pin;

    // If user has not set a PIN yet, allow "1234" as default or let them set it
    const expectedPin = storedPin ? String(storedPin).trim() : "1234";

    if (String(pin).trim() !== expectedPin) {
      return NextResponse.json(
        { valid: false, error: "Incorrect 4-digit PIN. Please try again." },
        { status: 400 }
      );
    }

    return NextResponse.json({ valid: true, message: "PIN verified successfully" });
  } catch (err: any) {
    console.error("PIN verification error:", err);
    return NextResponse.json({ valid: false, error: err.message || "Failed to verify PIN" }, { status: 500 });
  }
}
