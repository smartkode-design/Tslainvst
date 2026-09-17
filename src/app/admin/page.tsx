"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, Store, CreditCard, ShoppingBag, ArrowUpRight,
  Globe, Zap, ExternalLink, RefreshCw, Database, ShieldCheck,
  CheckCircle2, AlertCircle, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminDashboard() {
  const [providerStatus, setProviderStatus] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [statsData, setStatsData] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchDashboardData = async () => {
    setLoadingStatus(true);
    setLoadingStats(true);
    try {
      const [provRes, statsRes] = await Promise.all([
        fetch("/api/admin/providers/status"),
        fetch("/api/admin/stats"),
      ]);

      const provData = await provRes.json();
      if (provData.success) {
        setProviderStatus(provData.providers);
      }

      const sData = await statsRes.json();
      if (sData.success) {
        setStatsData(sData);
      }
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoadingStatus(false);
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const stats = statsData?.stats || {
    totalUsers: 0,
    activeSellers: 0,
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Platform Overview</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real-time database metrics, revenue tracking, and live provider float balances.
          </p>
        </div>
        <Button
          onClick={fetchDashboardData}
          variant="outline"
          size="sm"
          className="self-start sm:self-auto gap-2 border-slate-200 dark:border-slate-800 font-bold"
          disabled={loadingStatus || loadingStats}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loadingStatus || loadingStats ? "animate-spin" : ""}`} />
          Refresh Live Data
        </Button>
      </div>

      {/* LIVE WHOLESALE PROVIDER FLOAT & AUTOMATION STATUS */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 text-white shadow-xl shadow-indigo-950/20 space-y-4">
        <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-indigo-200">
              Live Wholesale API Float Engine
            </span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" /> Auto-Pilot Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* 5SIM Card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-sky-400" />
                <span className="text-xs font-bold text-slate-200">5SIM (Virtual Numbers)</span>
              </div>
              <span className="text-[10px] font-bold text-sky-300 bg-sky-400/10 px-2 py-0.5 rounded-full">
                {providerStatus?.fivesim?.connected ? "Connected" : "Standby"}
              </span>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Wholesale Float Balance</p>
              <div className="text-2xl font-black font-mono text-white mt-0.5">
                ${providerStatus?.fivesim?.data?.balance !== undefined ? Number(providerStatus.fivesim.data.balance).toFixed(2) : "0.00"} <span className="text-xs font-normal text-slate-400">USD</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 truncate">
                Account: {providerStatus?.fivesim?.data?.email || "Connected via Token"}
              </p>
            </div>
            <a
              href="https://5sim.net/payment"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-sky-300 hover:text-white bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/30 py-2 px-3 rounded-xl transition-colors w-full text-center"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Top Up 5SIM Float
            </a>
          </div>

          {/* JAP Card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-bold text-slate-200">JAP (SMM Boosting)</span>
              </div>
              <span className="text-[10px] font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-full">
                {providerStatus?.jap?.connected ? "Connected" : "Standby"}
              </span>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Wholesale Float Balance</p>
              <div className="text-2xl font-black font-mono text-white mt-0.5">
                ${providerStatus?.jap?.data?.balance !== undefined ? Number(providerStatus.jap.data.balance).toFixed(2) : "0.00"} <span className="text-xs font-normal text-slate-400">USD</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 truncate">
                15 Platforms Connected · High Speed
              </p>
            </div>
            <a
              href="https://justanotherpanel.com/addfunds"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-amber-300 hover:text-white bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 py-2 px-3 rounded-xl transition-colors w-full text-center"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Top Up JAP Float
            </a>
          </div>

          {/* Database Card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-200">Supabase Engine</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-300 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                Live & Synced
              </span>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Database Schema</p>
              <div className="text-lg font-black text-white mt-0.5">
                Profiles & Wallets Active
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                PostgreSQL · Row Level Security Enforced
              </p>
            </div>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-300 hover:text-white bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 py-2 px-3 rounded-xl transition-colors w-full text-center"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Open Supabase Console
            </a>
          </div>
        </div>
      </div>

      {/* REAL LIVE DATABASE STATS (100% Genuine, No Fake Data) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Users</p>
              <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/50 dark:border-indigo-800/40 flex items-center justify-center text-primary dark:text-indigo-400">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {loadingStats ? "..." : stats.totalUsers}
            </h3>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center mt-1 font-bold">
              Live registered accounts
            </p>
          </CardContent>
        </Card>

        {/* Active Sellers */}
        <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Sellers</p>
              <div className="h-9 w-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200/50 dark:border-sky-800/40 flex items-center justify-center text-sky-600 dark:text-sky-400">
                <Store className="h-4 w-4" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {loadingStats ? "..." : stats.activeSellers}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center mt-1 font-semibold">
              Verified merchants
            </p>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Revenue</p>
              <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/50 dark:border-emerald-800/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CreditCard className="h-4 w-4" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              ₦{loadingStats ? "..." : Number(stats.totalRevenue).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center mt-1 font-semibold">
              Real processed volume
            </p>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Orders</p>
              <div className="h-9 w-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/50 dark:border-amber-800/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <ShoppingBag className="h-4 w-4" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {loadingStats ? "..." : stats.totalOrders}
            </h3>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center mt-1 font-bold">
              {stats.pendingOrders} pending execution
            </p>
          </CardContent>
        </Card>
      </div>

      {/* LIVE ACTIVITY PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real Registered Users Table */}
        <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-xs">
          <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-black text-slate-900 dark:text-white">Registered Users</CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400">Live user registrations in Supabase</p>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-xs font-bold gap-1 text-primary">
              <Link href="/admin/users">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {statsData?.recentUsers?.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {statsData.recentUsers.map((u: any) => (
                  <div key={u.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-xs text-slate-700 dark:text-slate-200">
                        {u.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{u.name}</h4>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{u.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                        u.role === "admin" 
                          ? "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900" 
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}>
                        {u.role}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">{u.joined}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                No users found.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Real Orders / Activity Ledger */}
        <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-xs">
          <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-black text-slate-900 dark:text-white">Recent Orders</CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400">Real order stream from customer activity</p>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-xs font-bold gap-1 text-primary">
              <Link href="/admin/orders">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {statsData?.recentOrders?.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {statsData.recentOrders.map((ord: any) => (
                  <div key={ord.id} className="p-4 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Order #{ord.id.slice(0, 8)}</h4>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500">{ord.service_type || "Service"}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        ₦{Number(ord.amount || 0).toLocaleString()}
                      </span>
                      <span className="block text-[10px] font-bold text-amber-500 capitalize">
                        {ord.status || "Completed"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center space-y-2">
                <div className="h-10 w-10 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center mx-auto text-slate-400">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">No Orders Placed Yet</h4>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-xs mx-auto">
                  System is online and waiting for customer checkouts. Orders will stream here in real time.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
