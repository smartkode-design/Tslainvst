"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package, ShoppingBag, Wallet, TrendingUp, Plus,
  Loader2, ArrowRight, CheckCircle2, Clock, AlertCircle
} from "lucide-react";
import Link from "next/link";

export default function SellerDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [stats, setStats] = useState({ totalListings: 0, soldListings: 0, availableListings: 0 });
  const [recentListings, setRecentListings] = useState<any[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    const init = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;
      if (!session) { router.push("/login"); return; }

      // Verify seller role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (!profile || profile.role !== "seller") {
        router.push("/dashboard/seller-apply");
        return;
      }

      setUserId(session.user.id);

      // Fetch wallet balance
      const { data: wallet } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", session.user.id)
        .single();
      setWalletBalance(Number(wallet?.balance || 0));

      // Fetch listings & stats
      const res = await fetch(`/api/seller/listings?userId=${session.user.id}`);
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setRecentListings(data.listings.slice(0, 5));
      }

      setLoading(false);
    };
    init();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight mb-1">Seller Hub</h1>
          <p className="text-muted-foreground text-sm">Manage your listings and track your earnings.</p>
        </div>
        <Button asChild className="gap-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold self-start">
          <Link href="/seller/products/new">
            <Plus className="h-4 w-4" /> New Listing
          </Link>
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/20 text-[10px] py-0">Live</Badge>
            </div>
            <p className="text-sm font-semibold text-muted-foreground mb-1">Wallet Balance</p>
            <h3 className="text-2xl font-black font-mono">
              ₦{walletBalance.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-muted-foreground mt-1">Available for withdrawal</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <ShoppingBag className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <p className="text-sm font-semibold text-muted-foreground mb-1">Items Sold</p>
            <h3 className="text-2xl font-black">{stats.soldListings}</h3>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
              {stats.soldListings > 0 ? "Keep it up! 🔥" : "Make your first sale!"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Package className="h-5 w-5 text-purple-500" />
              </div>
            </div>
            <p className="text-sm font-semibold text-muted-foreground mb-1">Active Listings</p>
            <h3 className="text-2xl font-black">{stats.availableListings}</h3>
            <p className="text-[11px] text-muted-foreground mt-1">Visible on marketplace</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
            </div>
            <p className="text-sm font-semibold text-muted-foreground mb-1">Total Listings</p>
            <h3 className="text-2xl font-black">{stats.totalListings}</h3>
            <p className="text-[11px] text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Listings */}
      <Card>
        <div className="p-5 border-b border-border/50 flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-foreground">Recent Listings</h2>
            <p className="text-xs text-muted-foreground">Your latest product listings</p>
          </div>
          <Button asChild variant="outline" size="sm" className="rounded-xl text-xs font-bold gap-1">
            <Link href="/seller/listings">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
        <CardContent className="p-0">
          {recentListings.length === 0 ? (
            <div className="p-12 text-center space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground mb-1">No Listings Yet</h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Create your first listing. Add credentials and set a price — buyers pay instantly from their wallet.
                </p>
              </div>
              <Button asChild size="sm" className="gap-2 rounded-xl font-bold">
                <Link href="/seller/products/new">
                  <Plus className="h-4 w-4" /> Add Your First Listing
                </Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {recentListings.map((listing) => (
                <div key={listing.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-black ${
                      listing.status === "sold"
                        ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600"
                        : "bg-blue-50 dark:bg-blue-950/50 text-blue-600"
                    }`}>
                      {listing.status === "sold" ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{listing.title}</p>
                      <p className="text-[11px] text-muted-foreground capitalize">{listing.category} • {listing.createdAt}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-foreground font-mono">
                      ₦{Number(listing.price).toLocaleString()}
                    </p>
                    <Badge className={`text-[10px] py-0 ${
                      listing.status === "sold"
                        ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 border-emerald-200 dark:border-emerald-900"
                        : "bg-blue-50 dark:bg-blue-950/50 text-blue-600 border-blue-200 dark:border-blue-900"
                    }`}>
                      {listing.status === "sold" ? "Sold" : "Available"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reseller Virtual Numbers & Client Links Quick Card */}
      <Card className="border border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-primary/5">
        <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">📲</span>
              <h3 className="text-base font-black text-foreground">Vendor Client OTP Portals</h3>
              <Badge className="bg-emerald-500 text-white text-[9px] font-black py-0">Hot Feature</Badge>
            </div>
            <p className="text-xs text-muted-foreground max-w-xl">
              Buy wholesale virtual numbers for WhatsApp, Telegram & 50+ services and send your client a live OTP tracking link. They see their number and OTP in real-time with zero registration!
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button asChild className="rounded-xl font-bold text-xs h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
              <Link href="/dashboard/services/virtual-no">
                <span>Buy Virtual Number</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl font-bold text-xs h-10 px-4">
              <Link href="/dashboard/orders">View OTP Orders</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Banner */}
      <div className="p-4 rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 flex gap-3">
        <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-700 dark:text-amber-400">
          <span className="font-black">Platform Fee:</span> TSLA takes a 10% commission on every successful sale.
          You keep 90% of the listing price, paid instantly to your wallet.
        </div>
      </div>
    </div>
  );
}
