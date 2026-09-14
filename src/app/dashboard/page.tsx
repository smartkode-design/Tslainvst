"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Plus, ArrowUpRight, ArrowDownRight, Smartphone, Wifi, Zap, Globe, 
  Store, Eye, EyeOff, ShieldCheck, ChevronRight, History 
} from "lucide-react";
import Link from "next/link";

export default function DashboardOverview() {
  const [showBalance, setShowBalance] = useState(true);

  // Clean, cohesive service actions with soft elegant pastels (Primex style)
  const quickServices = [
    { 
      icon: Globe, 
      label: "Virtual Number", 
      href: "/dashboard/services/virtual-no", 
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50 hover:bg-blue-100/80" 
    },
    { 
      icon: Zap, 
      label: "Boost Account", 
      href: "/dashboard/services/boost-socials", 
      iconColor: "text-purple-600",
      bgColor: "bg-purple-50 hover:bg-purple-100/80" 
    },
    { 
      icon: Store, 
      label: "Buy Logs", 
      href: "/marketplace", 
      iconColor: "text-emerald-600",
      bgColor: "bg-emerald-50 hover:bg-emerald-100/80" 
    },
    { 
      icon: Smartphone, 
      label: "Buy Airtime", 
      href: "/dashboard/services/buy-airtime", 
      iconColor: "text-amber-600",
      bgColor: "bg-amber-50 hover:bg-amber-100/80" 
    },
    { 
      icon: Wifi, 
      label: "Buy Data", 
      href: "/dashboard/services/buy-data", 
      iconColor: "text-teal-600",
      bgColor: "bg-teal-50 hover:bg-teal-100/80" 
    },
    { 
      icon: ShieldCheck, 
      label: "Get Affiliate Site", 
      href: "/dashboard/services/affiliate-site", 
      iconColor: "text-indigo-600",
      bgColor: "bg-indigo-50 hover:bg-indigo-100/80" 
    },
  ];

  const recentTransactions = [
    { id: 1, type: "credit", amount: "+₦50,000.00", desc: "Automated Deposit · Palmpay", date: "Today, 10:24 AM" },
    { id: 2, type: "debit", amount: "-₦3,680.00", desc: "Buy Logs · Facebook 2FA Account", date: "Today, 08:15 AM" },
    { id: 3, type: "debit", amount: "-₦1,450.00", desc: "SMM Boost · 1,000 Instagram Followers", date: "Yesterday, 19:40 PM" },
    { id: 4, type: "debit", amount: "-₦1,390.00", desc: "MTN Data · 5.0 GB Corporate", date: "Sep 12, 11:30 AM" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24 md:pb-12 pt-1 md:pt-4 px-2 sm:px-4">
      {/* Top Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Hi, Oluwaseun 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Your personal digital trade overview
          </p>
        </div>
        <Link href="/dashboard/transactions" className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 bg-white border border-slate-200/80 px-3.5 py-2 rounded-xl shadow-2xs transition-colors">
          <History className="h-3.5 w-3.5 text-slate-400" />
          <span>Statement</span>
        </Link>
      </div>

      {/* Main Balance Hero Card (Clean, Luxurious Sapphire Navy) */}
      <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-950/10 relative overflow-hidden border border-slate-900">
        {/* Subtle, soft ambient glow */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Available Balance</span>
              <button 
                onClick={() => setShowBalance(!showBalance)}
                className="text-slate-400 hover:text-white transition-colors p-0.5"
                title="Toggle balance visibility"
              >
                {showBalance ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              </button>
              <div className="flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-400">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active
              </div>
            </div>

            <div className="text-3xl sm:text-5xl font-black tracking-tight text-white font-mono">
              {showBalance ? (
                <>₦248,500<span className="text-slate-400 text-xl sm:text-3xl">.00</span></>
              ) : (
                "••••••••••"
              )}
            </div>

            <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 pt-0.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Automated instant funding active
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link href="/dashboard/wallet/fund" className="flex-1 sm:flex-initial">
              <Button className="w-full sm:w-auto h-12 px-7 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 font-black text-xs shadow-md transition-transform active:scale-95 border-0">
                <Plus className="h-4 w-4 mr-1.5 text-primary" /> Fund Wallet
              </Button>
            </Link>
            <Link href="/dashboard/services/buy-data" className="flex-1 sm:flex-initial">
              <Button variant="outline" className="w-full sm:w-auto h-12 px-6 rounded-2xl bg-white/10 border-white/15 text-white hover:bg-white/20 font-bold text-xs transition-transform active:scale-95">
                <ArrowUpRight className="h-4 w-4 mr-1.5" /> Transfer
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions (Uncluttered, Native App Grid) */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">Quick Actions</h2>
          <Link href="/dashboard/services" className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5">
            View all <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
          {quickServices.map((service, i) => {
            const Icon = service.icon;
            return (
              <Link key={i} href={service.href} className="group">
                <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-white border border-slate-200/70 hover:border-slate-300 hover:shadow-sm transition-all duration-200 gap-2.5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 duration-200 ${service.bgColor}`}>
                    <Icon className={`h-6 w-6 ${service.iconColor}`} strokeWidth={2.2} />
                  </div>
                  <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900 leading-tight">
                    {service.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Transactions (Clean, Uncluttered Ledger) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base tracking-tight">Recent Activity</h3>
            <p className="text-xs text-slate-400 font-medium">Your latest wallet movements</p>
          </div>
          <Link href="/dashboard/transactions" className="text-xs font-bold text-primary hover:underline">
            See all
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {recentTransactions.map((trx) => (
            <div key={trx.id} className="py-3.5 first:pt-1 last:pb-1 flex items-center justify-between gap-3 group">
              <div className="flex items-center gap-3.5 overflow-hidden">
                <div className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  trx.type === 'credit' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-700'
                }`}>
                  {trx.type === 'credit' ? <ArrowDownRight className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-xs sm:text-sm text-slate-900 truncate group-hover:text-primary transition-colors">
                    {trx.desc}
                  </p>
                  <p className="text-[11px] font-medium text-slate-400">{trx.date}</p>
                </div>
              </div>
              <span className={`text-xs sm:text-sm font-black shrink-0 ${
                trx.type === 'credit' ? 'text-emerald-600' : 'text-slate-900'
              }`}>
                {trx.amount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
