import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AspfiyService } from "@/lib/providers/aspfiy";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
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

    const { searchParams } = new URL(req.url);
    const queryUserId = searchParams.get("userId");

    const userId = authenticatedUserId || queryUserId;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Check if user already has an active virtual account
    const { data: wallet } = await supabaseAdmin
      .from("wallets")
      .select("id, payvessel_account_number, bank_name, account_name")
      .eq("user_id", userId)
      .single();

    if (wallet?.payvessel_account_number) {
      return NextResponse.json({
        success: true,
        account: {
          accountNumber: wallet.payvessel_account_number,
          bankName: wallet.bank_name || "Paga",
          accountName: wallet.account_name || "Aspfiy-TSLA Account",
        },
      });
    }

    // 2. Fetch user profile to generate reserved account on Aspfiy
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("full_name, email, phone")
      .eq("id", userId)
      .single();

    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId);

    const email = profile?.email || authUser.user?.email || "user@tslainvst.com";
    const fullName = profile?.full_name || authUser.user?.user_metadata?.full_name || "TSLA User";
    const phone = profile?.phone || authUser.user?.user_metadata?.phone || "09134867896";

    const nameParts = fullName.trim().split(" ");
    const firstName = nameParts[0] || "User";
    const lastName = nameParts.slice(1).join(" ") || "TSLA";

    // 3. Reserve dedicated account via Aspfiy
    const reserved = await AspfiyService.reserveVirtualAccount({
      userId,
      email,
      firstName,
      lastName,
      phone,
    });

    // 4. Save account details in wallet
    if (wallet) {
      await supabaseAdmin
        .from("wallets")
        .update({
          payvessel_account_number: reserved.accountNumber,
          bank_name: reserved.bankName,
          account_name: reserved.accountName,
          updated_at: new Date().toISOString(),
        })
        .eq("id", wallet.id);
    } else {
      await supabaseAdmin.from("wallets").insert({
        user_id: userId,
        balance: 0,
        currency: "NGN",
        payvessel_account_number: reserved.accountNumber,
        bank_name: reserved.bankName,
        account_name: reserved.accountName,
      });
    }

    return NextResponse.json({
      success: true,
      account: {
        accountNumber: reserved.accountNumber,
        bankName: reserved.bankName,
        accountName: reserved.accountName,
      },
    });
  } catch (err: any) {
    console.error("Virtual account endpoint error:", err);
    return NextResponse.json(
      { error: err.message || "Could not retrieve virtual account" },
      { status: 500 }
    );
  }
}
