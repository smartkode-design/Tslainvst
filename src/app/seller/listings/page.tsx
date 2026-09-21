"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Package, Plus, Loader2, Trash2, Search,
  CheckCircle2, Clock, RefreshCw, Eye, EyeOff
} from "lucide-react";
import Link from "next/link";

export default function SellerListingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalListings: 0, soldListings: 0, availableListings: 0 });
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showCreds, setShowCreds] = useState<Record<string, boolean>>({});

  const fetchListings = async (uid: string) => {
    const res = await fetch(`/api/seller/listings?userId=${uid}`);
    const data = await res.json();
    if (data.success) {
      setListings(data.listings);
      setStats(data.stats);
    }
  };

  useEffect(() => {
    const init = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;
      if (!session) { router.push("/login"); return; }

      setUserId(session.user.id);
      const res = await fetch(`/api/seller/listings?userId=${session.user.id}`);
      const data = await res.json();

      if (!data.success) {
        router.push("/dashboard/seller-apply");
        return;
      }

      setListings(data.listings || []);
      setStats(data.stats || { totalListings: 0, soldListings: 0, availableListings: 0 });
      setLoading(false);
    };
    init();
  }, [router]);

  const handleDelete = async (listingId: string) => {
    if (!userId || !confirm("Remove this listing? This cannot be undone.")) return;
    setDeletingId(listingId);
    const res = await fetch("/api/seller/listings", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, listingId }),
    });
    const data = await res.json();
    if (data.success) {
      setListings((prev) => prev.filter((l) => l.id !== listingId));
    }
    setDeletingId(null);
  };

  const filtered = listings.filter((l) =>
    l.title.toLowerCase().includes(search.toLowerCase()) ||
    l.category.toLowerCase().includes(search.toLowerCase())
  );

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
          <h1 className="text-2xl font-black tracking-tight mb-1">My Listings</h1>
          <p className="text-muted-foreground text-sm">All your marketplace listings in one place.</p>
        </div>
        <div className="flex gap-2 items-center self-start">
          <Button
            onClick={() => userId && fetchListings(userId)}
            variant="outline" size="sm"
            className="gap-2 rounded-xl font-bold"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          <Button asChild className="gap-2 rounded-xl font-bold">
            <Link href="/seller/products/new">
              <Plus className="h-4 w-4" /> New Listing
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total", value: stats.totalListings, color: "text-slate-900 dark:text-white" },
          { label: "Available", value: stats.availableListings, color: "text-blue-600" },
          { label: "Sold", value: stats.soldListings, color: "text-emerald-600" },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="p-4 text-center">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
              <p className={`text-2xl font-black ${color}`}>{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Listings Table */}
      <Card>
        <CardHeader className="pb-4 border-b border-border/50">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <CardTitle className="text-base font-black">All Listings</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search listings..."
                className="pl-9 h-9 rounded-xl text-xs"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-12 text-center space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-sm font-bold text-foreground">No listings found</h3>
              <Button asChild size="sm" className="gap-2 rounded-xl font-bold">
                <Link href="/seller/products/new">
                  <Plus className="h-4 w-4" /> Add Listing
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 text-muted-foreground uppercase font-bold tracking-wider text-[10px] border-b border-border/50">
                  <tr>
                    <th className="p-4">Title</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Credentials Preview</th>
                    <th className="p-4">Listed</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filtered.map((listing) => (
                    <tr key={listing.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-foreground">{listing.title}</p>
                        {listing.description && (
                          <p className="text-[11px] text-muted-foreground line-clamp-1">{listing.description}</p>
                        )}
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="capitalize text-[10px]">
                          {listing.category}
                        </Badge>
                      </td>
                      <td className="p-4 font-black font-mono text-foreground">
                        ₦{Number(listing.price).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <Badge className={`text-[10px] py-0 gap-1 ${
                          listing.status === "sold"
                            ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 border-emerald-200"
                            : "bg-blue-50 dark:bg-blue-950/50 text-blue-600 border-blue-200"
                        }`}>
                          {listing.status === "sold"
                            ? <><CheckCircle2 className="h-3 w-3" /> Sold</>
                            : <><Clock className="h-3 w-3" /> Available</>
                          }
                        </Badge>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => setShowCreds((prev) => ({ ...prev, [listing.id]: !prev[listing.id] }))}
                          className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showCreds[listing.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          {showCreds[listing.id] ? "Hide" : "Show"}
                        </button>
                        {showCreds[listing.id] && (
                          <div className="mt-1 text-[10px] font-mono text-muted-foreground space-y-0.5 bg-muted/50 rounded-lg p-2">
                            <p>✦ Credentials stored securely</p>
                            <p className="text-green-600 dark:text-green-400">✓ Delivered on purchase</p>
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-muted-foreground">{listing.createdAt}</td>
                      <td className="p-4 text-right">
                        {listing.status === "available" && (
                          <Button
                            onClick={() => handleDelete(listing.id)}
                            disabled={deletingId === listing.id}
                            variant="ghost"
                            size="sm"
                            className="text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 font-bold rounded-lg gap-1"
                          >
                            {deletingId === listing.id
                              ? <Loader2 className="h-3 w-3 animate-spin" />
                              : <Trash2 className="h-3 w-3" />
                            }
                            Remove
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
