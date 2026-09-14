"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  CreditCard, Search, Filter, Download, ArrowDownLeft, ArrowUpRight, 
  CheckCircle2, Clock, AlertCircle, Zap, Store, Globe, Wifi, FileText 
} from "lucide-react";
import { Input } from "@/components/ui/input";

export default function TransactionsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const transactions = [
    { 
      id: "TRX-8932", 
      ref: "WT-0914-2391", 
      desc: "Wallet Funding via Palmpay Dedicated Account", 
      category: "deposit",
      type: "inflow", 
      amount: "+₦50,000.00", 
      date: "Sep 14, 2026 · 10:24 AM", 
      status: "Completed",
      statusColor: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
    },
    { 
      id: "TRX-8931", 
      ref: "LOG-0914-8812", 
      desc: "Buy Logs: Facebook 2FA (Aged 90+ Days)", 
      category: "logs",
      type: "outflow", 
      amount: "-₦3,680.00", 
      date: "Sep 14, 2026 · 08:15 AM", 
      status: "Completed",
      statusColor: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
    },
    { 
      id: "TRX-8930", 
      ref: "SMM-0913-1102", 
      desc: "SMM Boost: 1,000 Instagram Followers", 
      category: "smm",
      type: "outflow", 
      amount: "-₦1,450.00", 
      date: "Sep 13, 2026 · 19:40 PM", 
      status: "Completed",
      statusColor: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
    },
    { 
      id: "TRX-8929", 
      ref: "OTP-0912-3341", 
      desc: "Virtual Number: WhatsApp (USA +1)", 
      category: "virtual",
      type: "outflow", 
      amount: "-₦1,200.00", 
      date: "Sep 12, 2026 · 14:10 PM", 
      status: "Completed",
      statusColor: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
    },
    { 
      id: "TRX-8928", 
      ref: "VTU-0912-5521", 
      desc: "MTN Corporate Gifting Data · 5.0 GB", 
      category: "vtu",
      type: "outflow", 
      amount: "-₦1,390.00", 
      date: "Sep 12, 2026 · 11:30 AM", 
      status: "Completed",
      statusColor: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
    },
    { 
      id: "TRX-8927", 
      ref: "WT-0910-9921", 
      desc: "Wallet Funding via Bachs Dynamic Checkout", 
      category: "deposit",
      type: "inflow", 
      amount: "+₦100,000.00", 
      date: "Sep 10, 2026 · 09:12 AM", 
      status: "Completed",
      statusColor: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
    },
    { 
      id: "TRX-8926", 
      ref: "LOG-0909-1234", 
      desc: "Buy Logs: NordVPN Premium 1 Year", 
      category: "logs",
      type: "outflow", 
      amount: "-₦2,150.00", 
      date: "Sep 09, 2026 · 16:20 PM", 
      status: "Completed",
      statusColor: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
    },
  ];

  const filteredTransactions = transactions.filter(t => {
    const matchesTab = activeTab === "all" || 
                       (activeTab === "inflow" && t.type === "inflow") || 
                       (activeTab === "outflow" && t.type === "outflow");
    const matchesSearch = t.desc.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.ref.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 md:pb-12 pt-2 md:pt-4 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Transactions</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">Complete record of your automated deposits, purchases, and wallet activity</p>
        </div>
        <Button 
          variant="outline" 
          className="h-11 px-5 rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs flex items-center gap-2"
        >
          <Download className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          Export Statement
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by reference or service description..." 
            className="pl-11 h-12 bg-white dark:bg-slate-900 rounded-2xl border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm shadow-xs"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl w-full sm:w-auto">
          {[
            { id: "all", name: "All" },
            { id: "inflow", name: "Deposits" },
            { id: "outflow", name: "Debits" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id 
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs" 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-sm divide-y divide-slate-100 dark:divide-slate-800">
        {filteredTransactions.map((trx) => (
          <div key={trx.id} className="py-4.5 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 ${
                trx.type === "inflow" 
                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400" 
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}>
                {trx.type === "inflow" ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-primary dark:group-hover:text-indigo-400 transition-colors">
                  {trx.desc}
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{trx.ref}</span>
                  <span className="text-slate-300 dark:text-slate-600">·</span>
                  <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">{trx.date}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 pl-14 sm:pl-0">
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${trx.statusColor}`}>
                {trx.status}
              </span>
              <span className={`text-base font-black ${
                trx.type === "inflow" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"
              }`}>
                {trx.amount}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
