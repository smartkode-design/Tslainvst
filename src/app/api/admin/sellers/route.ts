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

    // Fetch active sellers with their listing counts
    const sellerProfiles = (profiles || []).filter((p) => p.role === "seller");

    // Fetch listing counts for each seller
    const sellerIds = sellerProfiles.map((s) => s.id);
    let listingCounts: Record<string, number> = {};
    if (sellerIds.length > 0) {
      const { data: listings } = await supabaseAdmin
        .from("marketplace_logs")
        .select("seller_id, status")
        .in("seller_id", sellerIds);
      (listings || []).forEach((l) => {
        if (l.seller_id) {
          listingCounts[l.seller_id] = (listingCounts[l.seller_id] || 0) + 1;
        }
      });
    }

    const sellers = sellerProfiles.map((s) => ({
      id: s.id,
      storeName: s.full_name ? `${s.full_name}'s Store` : "Merchant Store",
      merchantName: s.full_name || s.email?.split("@")[0] || "Seller",
      email: s.email,
      phone: s.phone || "—",
      activeProducts: listingCounts[s.id] || 0,
      totalSales: "₦0.00",
      status: "Verified Merchant",
      joined: new Date(s.created_at).toLocaleDateString("en-NG", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    }));

    // Candidate users who can be promoted
    const candidates = (profiles || [])
      .filter((p) => p.role !== "seller" && p.role !== "admin")
      .map((p) => ({
        id: p.id,
        name: p.full_name || p.email?.split("@")[0] || "User",
        email: p.email,
        role: p.role,
      }));

    // Pending seller applications
    const { data: applications } = await supabaseAdmin
      .from("seller_applications")
      .select("id, user_id, full_name, email, reason, social_handles, status, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    return NextResponse.json({ success: true, sellers, candidates, applications: applications || [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, role, applicationId, action } = body;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const newRole = action === "reject" ? "user" : (role || "seller");

    // Update user role in public.profiles
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;

    // Also update auth.users metadata for session consistency
    try {
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: { role: newRole },
        app_metadata: { role: newRole },
      });
    } catch (authErr) {
      console.warn("Auth user metadata sync notice:", authErr);
    }

    // If there's an application, update its status
    if (applicationId) {
      await supabaseAdmin
        .from("seller_applications")
        .update({
          status: action === "reject" ? "rejected" : "approved",
        })
        .eq("id", applicationId);
    } else {
      // Try to find application by user_id and update it
      await supabaseAdmin
        .from("seller_applications")
        .update({
          status: action === "reject" ? "rejected" : "approved",
        })
        .eq("user_id", userId);
    }

    return NextResponse.json({ success: true, profile: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
