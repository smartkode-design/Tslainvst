import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { PaystackService } from "@/lib/providers/paystack";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount: rawAmount, email: inputEmail } = body;

    // 1. Authenticate caller
    let authenticatedUserId: string | null = null;
    let userEmail: string | null = inputEmail || null;

    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const {
        data: { user },
        error,
      } = await supabaseAdmin.auth.getUser(token);
      if (user && !error) {
        authenticatedUserId = user.id;
        if (!userEmail && user.email) {
          userEmail = user.email;
        }
      }
    }

    if (!authenticatedUserId && body.userId) {
      const { data: verifiedProfile } = await supabaseAdmin
        .from("profiles")
        .select("id, email")
        .eq("id", body.userId)
        .single();

      if (verifiedProfile) {
        authenticatedUserId = verifiedProfile.id;
        if (!userEmail && verifiedProfile.email) {
          userEmail = verifiedProfile.email;
        }
      }
    }

    if (!authenticatedUserId) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    if (!userEmail) {
      return NextResponse.json({ error: "User email is required for payment processing." }, { status: 400 });
    }

    // 2. Validate deposit amount
    const amountNGN = Math.floor(Number(rawAmount));
    if (isNaN(amountNGN) || amountNGN < 100) {
      return NextResponse.json(
        { error: "Invalid deposit amount. Minimum deposit is ₦100." },
        { status: 400 }
      );
    }

    // 3. Construct callback URL
    let callbackUrl: string | undefined;
    const originHeader = req.headers.get("origin") || req.headers.get("referer");
    if (originHeader) {
      try {
        const originUrl = new URL(originHeader).origin;
        callbackUrl = `${originUrl}/dashboard/wallet?payment=paystack`;
      } catch {
        callbackUrl = "https://www.tslainvst.com/dashboard/wallet?payment=paystack";
      }
    }

    // 4. Initialize transaction on Paystack
    const paystackData = await PaystackService.initializeTransaction(
      userEmail,
      amountNGN,
      authenticatedUserId,
      callbackUrl
    );

    return NextResponse.json({
      success: true,
      authorizationUrl: paystackData.authorization_url,
      accessCode: paystackData.access_code,
      reference: paystackData.reference,
    });
  } catch (error: any) {
    console.error("Paystack initialize error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initialize payment" },
      { status: 500 }
    );
  }
}
