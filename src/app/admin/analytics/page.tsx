"use client";

import { useState, useEffect } from "react";
import { 
  BarChart, Users, DollarSign, ShoppingBag, ShieldCheck, 
  TrendingUp, RefreshCw, Smartphone, Rocket, Package, 
  Layers, CheckCircle2 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function formatNaira(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/analytics");
      const json = await res.json();
      if (json.success) {
        setData(json.analytics);
      }
    } catch (err) {
      console.error("Failed to load analytics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1 flex items-center gap-2.5">
            <BarChart className="h-6 w-6 text-primary" />
            Performance & Growth Analytics
          </h1>
          <p className="text-muted-foreground text-sm">
            Live database telemetry with 100% genuine Supabase metrics. Zero simulated data.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAnalytics} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 gap-2 text-muted-foreground">
          <RefreshCw className="h-5 w-5 animate-spin text-primary" />
          <span>Computing platform performance metrics...</span>
        </div>
      ) : (
        <>
          {/* Main Key Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card border-border/60">
              <CardContent className="p-5">
                <div className="flex items-center justify-between text-muted-foreground mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Registered Users</span>
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div className="text-2xl font-black">{data?.users?.total ?? 0}</div>
                <p className="text-[11px] text-muted-foreground mt-1">Verified Supabase accounts</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/60">
              <CardContent className="p-5">
                <div className="flex items-center justify-between text-muted-foreground mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Customer Float</span>
                  <DollarSign className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-black text-emerald-500">
                  ₦{formatNaira(data?.financials?.totalFloat ?? 0)}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">Total active wallet balances</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/60">
              <CardContent className="p-5">
                <div className="flex items-center justify-between text-muted-foreground mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Volume</span>
                  <TrendingUp className="h-4 w-4 text-indigo-500" />
                </div>
                <div className="text-2xl font-black text-indigo-500">
                  ₦{formatNaira(data?.financials?.totalPurchases ?? 0)}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">Platform service spend</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/60">
              <CardContent className="p-5">
                <div className="flex items-center justify-between text-muted-foreground mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Orders</span>
                  <ShoppingBag className="h-4 w-4 text-amber-500" />
                </div>
                <div className="text-2xl font-black text-amber-500">{data?.orders?.total ?? 0}</div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {data?.orders?.completed ?? 0} fulfilled successfully
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed breakdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold">User Population Breakdown</CardTitle>
                <CardDescription className="text-xs">
                  Distribution of registered accounts across user roles in the database.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-border/40">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span>Regular Customers</span>
                  </div>
                  <span className="font-bold text-sm">{data?.users?.standard ?? 0}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/40">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                    <span>Verified Sellers</span>
                  </div>
                  <span className="font-bold text-sm">{data?.users?.sellers ?? 0}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>System Administrators</span>
                  </div>
                  <span className="font-bold text-sm">{data?.users?.admins ?? 0}</span>
                </div>
              </CardContent>
            </Card>

            {/* Service Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold">Order Category Distribution</CardTitle>
                <CardDescription className="text-xs">
                  Volume breakdown between SMS verifications, SMM boosts, and marketplace logs.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-border/40">
                  <div className="flex items-center gap-2 text-sm">
                    <Smartphone className="h-4 w-4 text-emerald-500" />
                    <span>Virtual Numbers (SMS OTP)</span>
                  </div>
                  <span className="font-bold text-sm">{data?.orders?.byType?.sms ?? 0}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/40">
                  <div className="flex items-center gap-2 text-sm">
                    <Rocket className="h-4 w-4 text-indigo-500" />
                    <span>Social Media Boosting (SMM)</span>
                  </div>
                  <span className="font-bold text-sm">{data?.orders?.byType?.smm ?? 0}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4 text-amber-500" />
                    <span>Marketplace Credentials & Logs</span>
                  </div>
                  <span className="font-bold text-sm">{data?.orders?.byType?.log ?? 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
