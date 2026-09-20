"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { 
  Plus, ArrowUpRight, ArrowDownLeft, Smartphone, Wifi, Zap, Globe, 
  Store, Eye, EyeOff, ShieldCheck, ChevronRight, History, Loader2
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "./layout";
import { supabase } from "@/lib/supabase/client";

interface Transaction {
  id: string;
  reference?: string;
  description: string;
  amount: number;
  type: string;
  status: string;
  created_at: string;
}

function formatNaira(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function cleanTransactionDescription(desc: string): string {
  if (!desc) return "Wallet Transaction";
  return desc
    .replace(/^Admin refund for /i, "System Refund: ")
    .replace(/^Admin refund /i, "System Refund: ")
    .replace(/^Admin manual credit:\s*/i, "System Credit: ")
    .replace(/^Admin manual debit:\s*/i, "System Adjustment: ")
    .replace(/^Admin credit:\s*/i, "System Credit: ")
    .replace(/^Admin credit\s*/i, "System Credit ");
}

export default function DashboardOverview() {
  const [showBalance, setShowBalance] = useState(true);
  const { user, wallet, loading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTxns, setLoadingTxns] = useState(true);

  const fetchRecentTxns = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);

      if (!error && data) {
        setTransactions(data);
      }
    } catch (err) {
      console.error("Error loading recent transactions:", err);
    } finally {
      setLoadingTxns(false);
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    fetchRecentTxns(user.id);

    const channel = supabase
      .channel(`dashboard-recent-txns-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transactions",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchRecentTxns(user.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchRecentTxns]);

  const quickServices = [
    { 
      icon: Globe, 
      label: "Virtual Number", 
      href: "/dashboard/services/virtual-no", 
      iconColor: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100/80 dark:hover:bg-blue-900/50" 
    },
    { 
      icon: Zap, 
      label: "Boost Account", 
      href: "/dashboard/services/boost-socials", 
      iconColor: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100/80 dark:hover:bg-purple-900/50" 
    },
    { 
      icon: Store, 
      label: "Buy Logs", 
      href: "/marketplace", 
      iconColor: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/50" 
    },
    { 
      icon: Smartphone, 
      label: "Buy Airtime", 
      href: "/dashboard/services/buy-airtime", 
      iconColor: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100/80 dark:hover:bg-amber-900/50" 
    },
    { 
      icon: Wifi, 
      label: "Buy Data", 
      href: "/dashboard/services/buy-data", 
      iconColor: "text-teal-600 dark:text-teal-400",
      bgColor: "bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100/80 dark:hover:bg-teal-900/50" 
    },
    { 
      icon: ShieldCheck, 
      label: "Get Affiliate Site", 
      href: "/dashboard/services/affiliate-site", 
      iconColor: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100/80 dark:hover:bg-indigo-900/50" 
    },
  ];

  const balance = wallet?.balance ?? 0;
  const [nairaWhole, nairaCents] = formatNaira(balance).split(".");

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24 md:pb-12 pt-1 md:pt-4 px-2 sm:px-4">
      {/* Top Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {loading ? (
              <span className="inline-flex items-center gap-2 text-slate-400">
                <Loader2 className="h-5 w-5 animate-spin" /> Loading...
              </span>
            ) : (
              <>Hi, {user?.firstName} 👋</>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Your personal digital trade overview
          </p>
        </div>
        <Link href="/dashboard/transactions" className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-3.5 py-2 rounded-xl shadow-2xs transition-colors">
          <History className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
          <span>Statement</span>
        </Link>
      </div>

      {/* Main Balance Hero Card */}
      <div className="bg-slate-950 dark:bg-slate-900/90 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-950/20 relative overflow-hidden border border-slate-900 dark:border-slate-800">
        {/* Ambient glow */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

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
              {loading ? (
                <span className="text-slate-500 text-2xl sm:text-3xl animate-pulse">Loading...</span>
              ) : showBalance ? (
                <>₦{nairaWhole}<span className="text-slate-400 text-xl sm:text-3xl">.{nairaCents}</span></>
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
            <Link href="/dashboard/wallet/fund" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto h-12 px-7 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 font-black text-xs shadow-md transition-transform active:scale-95 border-0">
                <Plus className="h-4 w-4 mr-1.5 text-primary" /> Fund Wallet
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">Quick Actions</h2>
          <Link href="/dashboard/services" className="text-xs font-bold text-primary dark:text-indigo-400 hover:underline flex items-center gap-0.5">
            View all <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
          {quickServices.map((service, i) => {
            const Icon = service.icon;
            return (
              <Link key={i} href={service.href} className="group">
                <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm transition-all duration-200 gap-2.5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 duration-200 ${service.bgColor}`}>
                    <Icon className={`h-6 w-6 ${service.iconColor}`} strokeWidth={2.2} />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white leading-tight">
                    {service.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight">Recent Activity</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Your latest wallet movements</p>
          </div>
          <Link href="/dashboard/transactions" className="text-xs font-bold text-primary dark:text-indigo-400 hover:underline">
            See all
          </Link>
        </div>

        {loadingTxns ? (
          <div className="flex items-center justify-center py-10 gap-2 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-xs font-medium">Loading transactions...</span>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <History className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No transactions yet</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">Fund your wallet to get started</p>
            <Link href="/dashboard/wallet/fund">
              <Button size="sm" className="mt-1 rounded-xl font-bold text-xs h-9 px-5">
                <Plus className="h-3.5 w-3.5 mr-1.5" /> Fund Wallet
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {transactions.map((item) => {
                const isCredit =
                  item.type === "credit" ||
                  item.type === "inflow" ||
                  item.type === "deposit" ||
                  item.type === "bonus" ||
                  item.type === "refund";
                const date = new Date(item.created_at).toLocaleDateString("en-NG", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });
                return (
                  <div
                    key={item.id}
                    className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 px-2 rounded-2xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 ${
                          isCredit
                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {isCredit ? (
                          <ArrowDownLeft className="h-5 w-5" />
                        ) : (
                          <ArrowUpRight className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                          {cleanTransactionDescription(item.description)}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                            {date}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 rounded border capitalize ${
                              item.status === "completed" || item.status === "success"
                                ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-100 dark:border-emerald-900/60"
                                : item.status === "pending"
                                ? "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-100 dark:border-amber-900/60"
                                : "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border-red-100 dark:border-red-900/60"
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`text-sm sm:text-base font-black font-mono ${
                          isCredit
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-slate-900 dark:text-white"
                        }`}
                      >
                        {isCredit ? "+" : "-"}₦{formatNaira(Math.abs(item.amount))}
                      </span>
                      <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        {item.reference ? item.reference.slice(0, 10) : item.id.slice(0, 8).toUpperCase()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800">
              <Link
                href="/dashboard/transactions"
                className="text-xs font-bold text-primary dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
              >
                View all transactions <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

