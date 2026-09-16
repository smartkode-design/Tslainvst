"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, Store, CreditCard, ShoppingBag, ArrowUpRight, ArrowDownRight,
  Globe, Zap, ExternalLink, RefreshCw, Database, CheckCircle2, AlertCircle, ShieldCheck
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const [providerStatus, setProviderStatus] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  const fetchProviderStatus = async () => {
    setLoadingStatus(true);
    try {
      const res = await fetch("/api/admin/providers/status");
      const data = await res.json();
      if (data.success) {
        setProviderStatus(data.providers);
      }
    } catch (err) {
      console.error("Failed to load provider status", err);
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchProviderStatus();
  }, []);
  const revenueData = [
    { name: 'Jan', total: 1200000 },
    { name: 'Feb', total: 2100000 },
    { name: 'Mar', total: 1800000 },
    { name: 'Apr', total: 3200000 },
    { name: 'May', total: 2900000 },
    { name: 'Jun', total: 4500000 },
    { name: 'Jul', total: 5200000 },
  ];

  const orderData = [
    { name: 'Mon', orders: 120 },
    { name: 'Tue', orders: 145 },
    { name: 'Wed', orders: 130 },
    { name: 'Thu', orders: 180 },
    { name: 'Fri', orders: 250 },
    { name: 'Sat', orders: 310 },
    { name: 'Sun', orders: 280 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Platform Overview</h1>
          <p className="text-muted-foreground">High-level metrics, revenue, and live wholesale float tracking.</p>
        </div>
        <Button
          onClick={fetchProviderStatus}
          variant="outline"
          size="sm"
          className="self-start sm:self-auto gap-2 border-slate-200 dark:border-slate-800"
          disabled={loadingStatus}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loadingStatus ? "animate-spin" : ""}`} />
          Refresh Float
        </Button>
      </div>

      {/* WHOLESALE PROVIDER FLOAT & AUTOMATION STATUS */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 text-white shadow-xl shadow-indigo-950/20 space-y-4">
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
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col justify-between space-y-3">
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
              className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-sky-300 hover:text-white bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/30 py-2 px-3 rounded-lg transition-colors w-full text-center"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Top Up 5SIM Float
            </a>
          </div>

          {/* JAP Card */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col justify-between space-y-3">
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
                Twitter ID: 9011 · Instagram · TikTok
              </p>
            </div>
            <a
              href="https://justanotherpanel.com/addfunds"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-amber-300 hover:text-white bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 py-2 px-3 rounded-lg transition-colors w-full text-center"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Top Up JAP Float
            </a>
          </div>

          {/* Database Card */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-200">Supabase Engine</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-300 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                Live
              </span>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Database Schema</p>
              <div className="text-lg font-black text-white mt-0.5">
                5 Tables Live
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Profiles, Wallets, Transactions, Orders, Logs
              </p>
            </div>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-300 hover:text-white bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 py-2 px-3 rounded-lg transition-colors w-full text-center"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Open Supabase Console
            </a>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-xs">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Users</p>
              <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/50 dark:border-indigo-800/40 flex items-center justify-center text-primary dark:text-indigo-400">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">24,591</h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center mt-1.5 font-bold">
              <ArrowUpRight className="h-3.5 w-3.5 mr-1" /> +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-xs">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Sellers</p>
              <div className="h-9 w-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200/50 dark:border-sky-800/40 flex items-center justify-center text-sky-600 dark:text-sky-400">
                <Store className="h-4 w-4" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">1,432</h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center mt-1.5 font-bold">
              <ArrowUpRight className="h-3.5 w-3.5 mr-1" /> +4.2% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-xs">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Monthly Revenue</p>
              <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/50 dark:border-emerald-800/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CreditCard className="h-4 w-4" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">₦5.2M</h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center mt-1.5 font-bold">
              <ArrowUpRight className="h-3.5 w-3.5 mr-1" /> +18% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-xs">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pending Orders</p>
              <div className="h-9 w-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/50 dark:border-amber-800/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <ArrowDownRight className="h-4 w-4" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">42</h3>
            <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center mt-1.5 font-bold">
              Auto-processing queue
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-xs">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-black text-slate-900 dark:text-white">Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `₦${value / 1000000}M`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                  <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-xs">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-black text-slate-900 dark:text-white">Weekly Orders Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={orderData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }}
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  />
                  <Bar dataKey="orders" fill="#f97316" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
