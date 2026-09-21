import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { logId } = body;

    if (!logId) {
      return NextResponse.json({ error: "Missing logId parameter" }, { status: 400 });
    }

    // 1. Authenticate caller
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

    if (!authenticatedUserId && body.userId) {
      const { data: verifiedProfile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("id", body.userId)
        .single();

      if (verifiedProfile) {
        authenticatedUserId = verifiedProfile.id;
      }
    }

    if (!authenticatedUserId) {
      return NextResponse.json({ error: "Unauthorized. Please log in to purchase." }, { status: 401 });
    }

    // 2. Fetch log from database and verify it is available
    const { data: log, error: logErr } = await supabaseAdmin
      .from("marketplace_logs")
      .select("*")
      .eq("id", logId)
      .single();

    if (logErr || !log) {
      return NextResponse.json({ error: "Account log not found." }, { status: 404 });
    }

    if (log.status !== "available") {
      return NextResponse.json(
        { error: "This account has already been purchased by another user." },
        { status: 400 }
      );
    }

    const priceNGN = Number(log.price_ngn);
    if (isNaN(priceNGN) || priceNGN <= 0) {
      return NextResponse.json({ error: "Invalid product price configuration." }, { status: 400 });
    }

    // 3. Verify user wallet balance
    const { data: wallet, error: walletErr } = await supabaseAdmin
      .from("wallets")
      .select("id, balance")
      .eq("user_id", authenticatedUserId)
      .single();

    if (walletErr || !wallet) {
      return NextResponse.json({ error: "User wallet not found." }, { status: 404 });
    }

    const currentBalance = Number(wallet.balance || 0);

    // CRITICAL: Block purchase if balance is insufficient!
    if (currentBalance < priceNGN) {
      return NextResponse.json(
        {
          error: `Insufficient wallet balance. Required: ₦${priceNGN.toLocaleString()}, Available: ₦${currentBalance.toLocaleString()}`,
          insufficientFunds: true,
          required: priceNGN,
          available: currentBalance,
        },
        { status: 400 }
      );
    }

    // 4. Atomic debit with write-time balance guard (.gte)
    const newBalance = Number((currentBalance - priceNGN).toFixed(2));
    const { error: debitErr } = await supabaseAdmin
      .from("wallets")
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq("id", wallet.id)
      .gte("balance", priceNGN);

    if (debitErr) {
      return NextResponse.json(
        { error: "Transaction conflict. Please try again." },
        { status: 409 }
      );
    }

    // 5. Atomic lock on the log: mark as sold to this buyer
    const { data: updatedLog, error: logUpdateErr } = await supabaseAdmin
      .from("marketplace_logs")
      .update({
        status: "sold",
        sold_to: authenticatedUserId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", log.id)
      .eq("status", "available")
      .select()
      .single();

    if (logUpdateErr || !updatedLog) {
      // Rollback wallet debit if another buyer grabbed it at the same millisecond!
      console.warn("Log was grabbed by another user, rolling back wallet...");
      await supabaseAdmin
        .from("wallets")
        .update({ balance: currentBalance, updated_at: new Date().toISOString() })
        .eq("id", wallet.id);

      return NextResponse.json(
        { error: "This item was just acquired by another customer. Your balance was not charged." },
        { status: 409 }
      );
    }

    // 6. Record transaction audit log
    const reference = `LOG_${log.id.slice(0, 8)}_${Date.now()}`;
    await supabaseAdmin.from("transactions").insert({
      user_id: authenticatedUserId,
      amount: priceNGN,
      type: "purchase",
      status: "completed",
      reference,
      description: `Purchased Log: ${log.title}`,
      metadata: {
        logId: log.id,
        category: log.category,
        title: log.title,
      },
    });

    // 7. Record completed order
    const { data: orderRecord } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: authenticatedUserId,
        service_type: "log",
        provider: "marketplace",
        provider_order_id: log.id,
        service_name: log.title,
        target: log.title,
        quantity: 1,
        amount_ngn: priceNGN,
        cost_usd: 0,
        status: "completed",
        details: {
          logId: log.id,
          credentials: log.credentials,
        },
      })
      .select("id")
      .single();

    // 8. Pay seller their cut (if this listing has a seller)
    const sellerId = updatedLog.seller_id;
    if (sellerId && sellerId !== authenticatedUserId) {
      const commissionPct = Number(updatedLog.commission_pct || 10);
      const platformCut = Math.round(priceNGN * (commissionPct / 100) * 100) / 100;
      const sellerEarnings = Math.round((priceNGN - platformCut) * 100) / 100;

      // Find seller's wallet
      const { data: sellerWallet } = await supabaseAdmin
        .from("wallets")
        .select("id, balance")
        .eq("user_id", sellerId)
        .single();

      if (sellerWallet) {
        const newSellerBalance = Number((Number(sellerWallet.balance) + sellerEarnings).toFixed(2));
        await supabaseAdmin
          .from("wallets")
          .update({ balance: newSellerBalance, updated_at: new Date().toISOString() })
          .eq("id", sellerWallet.id);

        // Record seller's earnings transaction
        await supabaseAdmin.from("transactions").insert({
          user_id: sellerId,
          amount: sellerEarnings,
          type: "sale",
          status: "completed",
          reference: `SALE_${log.id.slice(0, 8)}_${Date.now()}`,
          description: `Sale: ${log.title} (Platform fee: ${commissionPct}%)`,
          metadata: { logId: log.id, buyerId: authenticatedUserId, commission: platformCut },
        });

        // Mark log as seller_paid
        await supabaseAdmin
          .from("marketplace_logs")
          .update({ seller_paid: true })
          .eq("id", log.id);
      }
    }

    // 9. Format credentials for copy-pasting
    let formattedText = "";
    if (typeof log.credentials === "string") {
      formattedText = log.credentials;
    } else if (typeof log.credentials === "object" && log.credentials !== null) {
      const parts: string[] = [];
      if (log.credentials.username) parts.push(`Username/Email: ${log.credentials.username}`);
      if (log.credentials.password) parts.push(`Password: ${log.credentials.password}`);
      if (log.credentials.two_factor) parts.push(`2FA Code/Secret: ${log.credentials.two_factor}`);
      if (log.credentials.recovery_email) parts.push(`Recovery: ${log.credentials.recovery_email}`);
      if (log.credentials.phone) parts.push(`Phone: ${log.credentials.phone}`);
      if (log.credentials.notes) parts.push(`Notes: ${log.credentials.notes}`);
      formattedText = parts.length > 0 ? parts.join("\n") : JSON.stringify(log.credentials, null, 2);
    }

    return NextResponse.json({
      success: true,
      orderId: orderRecord?.id || reference,
      reference,
      title: log.title,
      amountCharged: priceNGN,
      newBalance,
      credentials: log.credentials,
      formattedCredentials: formattedText,
    });
  } catch (err: any) {
    console.error("Marketplace buy error:", err);
    return NextResponse.json({ error: err.message || "Failed to process purchase" }, { status: 500 });
  }
}
