"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Receipt, Search, Filter, CheckCircle2, Clock, AlertCircle, 
  ExternalLink, Copy, Check, Eye, EyeOff, Store, Zap, Globe, Wifi 
} from "lucide-react";
import { Input } from "@/components/ui/input";

export default function OrdersPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [revealedLogs, setRevealedLogs] = useState<Record<string, boolean>>({});

  const orders = [
    {
      id: "ORD-88219",
      category: "logs",
      title: "Facebook 2FA Account (Age: 90+ Days) · Korean IP",
      details: "Email: kim.minjun91@hotmail.com | Pass: K0r3a#Sec!2026 | 2FA: JBSWY3DPEHPK3PXP",
      date: "Today, 18:42",
      amount: "₦4,500.00",
      status: "Completed",
      statusColor: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
      icon: Store,
      iconColor: "text-amber-500 bg-amber-50 dark:bg-amber-950/60"
    },
    {
      id: "ORD-88218",
      category: "smm",
      title: "Instagram Followers [Guaranteed 30 Days Refill]",
      details: "Target: https://instagram.com/mybrand_ng · Qty: 2,500 Followers",
      date: "Today, 14:15",
      amount: "₦3,625.00",
      status: "In Progress (68%)",
      statusColor: "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
      icon: Zap,
      iconColor: "text-purple-500 bg-purple-50 dark:bg-purple-950/60"
    },
    {
      id: "ORD-88217",
      category: "virtual",
      title: "WhatsApp SMS OTP · USA (+1) Non-VoIP",
      details: "Number: +1 (202) 854-3918 · Received OTP: 849-204",
      date: "Yesterday, 21:05",
      amount: "₦1,200.00",
      status: "Completed",
      statusColor: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
      icon: Globe,
      iconColor: "text-pink-500 bg-pink-50 dark:bg-pink-950/60"
    },
    {
      id: "ORD-88216",
      category: "vtu",
      title: "MTN Corporate Gifting Data · 5.0 GB (30 Days)",
      details: "Recipient: 0814 892 0192 · Instant automated delivery",
      date: "Sep 12, 11:30",
      amount: "₦1,390.00",
      status: "Completed",
      statusColor: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
      icon: Wifi,
      iconColor: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60"
    },
    {
      id: "ORD-88215",
      category: "logs",
      title: "NordVPN Premium Account · 1 Year Subscription",
      details: "User: tech_streamer@gmail.com | Pass: N0rd!Sec991",
      date: "Sep 10, 09:12",
      amount: "₦2,150.00",
      status: "Completed",
      statusColor: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
      icon: Store,
      iconColor: "text-amber-500 bg-amber-50 dark:bg-amber-950/60"
    }
  ];

  const toggleReveal = (id: string) => {
    setRevealedLogs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredOrders = orders.filter(ord => {
    const matchesFilter = activeFilter === "all" || ord.category === activeFilter;
    const matchesSearch = ord.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ord.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 md:pb-12 pt-2 md:pt-4 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Order History</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">Track your social boosts, purchased accounts, and digital assets</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl w-full sm:w-auto overflow-x-auto">
          {[
            { id: "all", name: "All" },
            { id: "logs", name: "Buy Logs" },
            { id: "smm", name: "SMM Boost" },
            { id: "virtual", name: "Virtual No." },
            { id: "vtu", name: "VTU" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeFilter === tab.id 
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs" 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
        <Input 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by Order ID or Service name..." 
          className="pl-11 h-12 bg-white dark:bg-slate-900 rounded-2xl border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm shadow-xs"
        />
      </div>

      {/* Orders List Cards */}
      <div className="space-y-3.5">
        {filteredOrders.map((order) => {
          const Icon = order.icon;
          const isRevealed = revealedLogs[order.id];

          return (
            <div 
              key={order.id} 
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 ${order.iconColor}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{order.id}</span>
                      <span className="text-slate-300 dark:text-slate-700">·</span>
                      <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">{order.date}</span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">{order.title}</h3>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800">
                  <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${order.statusColor}`}>
                    {order.status}
                  </span>
                  <span className="text-base font-black text-slate-900 dark:text-white">{order.amount}</span>
                </div>
              </div>

              {/* Order Delivery Box / Credentials / Info */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200/70 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="font-mono text-slate-700 dark:text-slate-300 break-all">
                  {order.category === "logs" && !isRevealed 
                    ? "••••••••••••••••••••••••••••••••••••••••••••" 
                    : order.details}
                </div>

                {order.category === "logs" && (
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => toggleReveal(order.id)}
                    className="h-8 px-3 rounded-xl text-[11px] font-bold shrink-0 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    {isRevealed ? <EyeOff className="h-3.5 w-3.5 mr-1" /> : <Eye className="h-3.5 w-3.5 mr-1" />}
                    {isRevealed ? "Hide Credentials" : "View Credentials"}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
