"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowDownLeft, ArrowUpRight, Building2, CreditCard, Wallet, Plus, 
  ArrowDownRight, ShieldCheck, Zap, History, RefreshCw, CheckCircle2 
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState<"all" | "inflow" | "outflow">("all");

  const walletHistory = [
    { id: "TX-9901", desc: "Automated Bank Deposit (Palmpay)", amount: "+₦50,000.00", date: "Today, 10:24 AM", type: "inflow", status: "Completed" },
    { id: "TX-9902", desc: "Buy Logs: Facebook 2FA (Aged 90d)", amount: "-₦3,680.00", date: "Today, 08:15 AM", type: "outflow", status: "Completed" },
    { id: "TX-9903", desc: "SMM Boost: 1,000 Instagram Followers", amount: "-₦1,450.00", date: "Yesterday, 19:40 PM", type: "outflow", status: "Completed" },
    { id: "TX-9904", desc: "Virtual Number: WhatsApp (USA +1)", amount: "-₦1,200.00", date: "Sep 12, 14:10 PM", type: "outflow", status: "Completed" },
    { id: "TX-9905", desc: "P2P Wallet Transfer from @damilola", amount: "+₦20,000.00", date: "Sep 11, 09:30 AM", type: "inflow", status: "Completed" },
  ];

  const filteredHistory = walletHistory.filter(item => {
    if (activeTab === "inflow") return item.type === "inflow";
    if (activeTab === "outflow") return item.type === "outflow";
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 md:pb-12 pt-2 md:pt-4 px-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">My Wallet</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">Manage your balance, automated deposits, and transfers</p>
        </div>
        <Link href="/dashboard/wallet/fund">
          <Button className="h-11 px-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-md shadow-primary/20 flex items-center gap-1.5">
            <Plus className="h-4 w-4" /> Fund Wallet
          </Button>
        </Link>
      </div>

      {/* Main Balance Hero Card */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-900/10 relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Available Total Balance</span>
              <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white font-mono">
              ₦248,500<span className="text-slate-400 text-2xl sm:text-3xl">.00</span>
            </h2>
            <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 pt-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Protected by Bank-Grade 256-bit Security
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link href="/dashboard/wallet/fund" className="flex-1 sm:flex-initial">
              <Button className="w-full sm:w-auto h-12 px-7 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 font-black text-xs shadow-md">
                <Plus className="h-4 w-4 mr-1.5 text-primary" /> Add Money
              </Button>
            </Link>
            <Link href="/dashboard/services/buy-data" className="flex-1 sm:flex-initial">
              <Button variant="outline" className="w-full sm:w-auto h-12 px-6 rounded-2xl bg-white/10 border-white/20 text-white hover:bg-white/20 font-bold text-xs">
                <ArrowUpRight className="h-4 w-4 mr-1.5" /> Transfer
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Funding Account Shortcut */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-black text-slate-900 dark:text-white text-sm tracking-wide">Dedicated Virtual Bank Account</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Direct transfers to this account automatically fund your wallet instantly</p>
          </div>
          <Link href="/dashboard/wallet/fund" className="text-xs font-bold text-primary dark:text-indigo-400 hover:underline">
            Change Bank
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Bank Name</span>
            <p className="text-sm font-black text-slate-900 dark:text-white">Palmpay</p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Account Number</span>
            <p className="text-base font-black text-slate-900 dark:text-white font-mono tracking-wider">8920194821</p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Account Name</span>
            <p className="text-sm font-black text-slate-900 dark:text-white">TSLA - Oluwaseun A.</p>
          </div>
        </div>
      </div>

      {/* Transaction History Filterable Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="font-black text-slate-900 dark:text-white text-base">Wallet Ledger</h3>
          
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "all" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              All Transactions
            </button>
            <button
              onClick={() => setActiveTab("inflow")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "inflow" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Deposits
            </button>
            <button
              onClick={() => setActiveTab("outflow")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "outflow" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Debits
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredHistory.map((item) => (
            <div key={item.id} className="py-4 flex items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 px-2 rounded-2xl transition-colors">
              <div className="flex items-center gap-3.5">
                <div className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  item.type === "inflow" 
                    ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400" 
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}>
                  {item.type === "inflow" ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{item.desc}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">{item.date}</span>
                    <span className="text-[10px] font-bold text-slate-300 dark:text-slate-600">·</span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-100 dark:border-emerald-900/60">
                      {item.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className={`text-sm sm:text-base font-black ${
                  item.type === "inflow" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"
                }`}>
                  {item.amount}
                </span>
                <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{item.id}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
