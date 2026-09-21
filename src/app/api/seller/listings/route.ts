import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// GET: Fetch the authenticated seller's own listings
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Verify seller role
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, role")
      .eq("id", userId)
      .single();

    if (!profile || (profile.role !== "seller" && profile.role !== "admin")) {
      return NextResponse.json({ error: "Not authorized. Seller role required." }, { status: 403 });
    }

    const { data: listings, error } = await supabaseAdmin
      .from("marketplace_logs")
      .select("id, title, category, description, price_ngn, status, seller_paid, commission_pct, created_at, sold_to")
      .eq("seller_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const formatted = (listings || []).map((l) => ({
      id: l.id,
      title: l.title,
      category: l.category,
      description: l.description || "",
      price: l.price_ngn,
      status: l.status,
      commission: l.commission_pct || 10,
      sellerPaid: l.seller_paid,
      createdAt: new Date(l.created_at).toLocaleDateString("en-NG", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      soldTo: l.sold_to || null,
    }));

    // Summary stats
    const totalListings = formatted.length;
    const soldListings = formatted.filter((l) => l.status === "sold").length;
    const availableListings = formatted.filter((l) => l.status === "available").length;

    return NextResponse.json({
      success: true,
      listings: formatted,
      stats: { totalListings, soldListings, availableListings },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Seller creates a new listing
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, title, category, description, priceNgn, credentials } = body;

    if (!userId || !title || !category || !priceNgn || !credentials) {
      return NextResponse.json(
        { error: "Missing required fields: userId, title, category, priceNgn, credentials" },
        { status: 400 }
      );
    }

    // Verify seller role
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, role")
      .eq("id", userId)
      .single();

    if (!profile || (profile.role !== "seller" && profile.role !== "admin")) {
      return NextResponse.json({ error: "Not authorized. Seller role required." }, { status: 403 });
    }

    const price = Number(priceNgn);
    if (isNaN(price) || price < 100) {
      return NextResponse.json({ error: "Price must be at least ₦100" }, { status: 400 });
    }

    // Validate category
    const validCategories = ["facebook", "instagram", "twitter", "linkedin", "google_voice", "gmail", "other"];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    // Ensure credentials has at minimum a username or email
    const creds = typeof credentials === "object" ? credentials : {};
    if (!creds.username && !creds.email) {
      return NextResponse.json(
        { error: "Credentials must include at least a username or email" },
        { status: 400 }
      );
    }

    const { data: listing, error } = await supabaseAdmin
      .from("marketplace_logs")
      .insert({
        seller_id: userId,
        title: title.trim(),
        category,
        description: description?.trim() || null,
        price_ngn: price,
        credentials: creds,
        status: "available",
        commission_pct: 10, // Platform takes 10%
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, listing });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Seller removes an available listing
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { userId, listingId } = body;

    if (!userId || !listingId) {
      return NextResponse.json({ error: "Missing userId or listingId" }, { status: 400 });
    }

    // Verify ownership and that it hasn't been sold
    const { data: listing } = await supabaseAdmin
      .from("marketplace_logs")
      .select("id, seller_id, status")
      .eq("id", listingId)
      .single();

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.seller_id !== userId) {
      return NextResponse.json({ error: "You do not own this listing" }, { status: 403 });
    }

    if (listing.status === "sold") {
      return NextResponse.json({ error: "Cannot delete a sold listing" }, { status: 400 });
    }

    await supabaseAdmin.from("marketplace_logs").delete().eq("id", listingId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
