"use client";

import { Button } from "@/components/ui/button";
import { ArrowUpRight, Plus, ArrowDownLeft, ShieldCheck, History, CheckCircle2, AlertCircle, Loader2, Zap } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";

function formatNaira(amount: number): string {
  return new Intl.NumberFormat("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
}

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: string;
  status: string;
  created_at: string;
}

export default function WalletPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"all" | "inflow" | "outflow">("all");
  const [balance, setBalance] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Verification state for redirect returns (e.g. from Paystack)
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const loadData = useCallback(async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData?.session;
    if (!session) {
      router.replace("/login");
      return;
    }

    const userId = session.user.id;
    const [{ data: profile }, { data: wallet }, { data: txns }] = await Promise.all([
      supabase.from("profiles").select("full_name").eq("id", userId).single(),
      supabase.from("wallets").select("balance").eq("user_id", userId).single(),
      supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    const fullName = profile?.full_name || session.user.email?.split("@")[0] || "User";
    setUserName(fullName.split(" ")[0]);
    setBalance(Number(wallet?.balance ?? 0));
    setTransactions(txns ?? []);
    setCurrentUserId(userId);
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Realtime subscription for instant balance & ledger updates
  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel(`user-wallet-${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "wallets",
          filter: `user_id=eq.${currentUserId}`,
        },
        () => {
          loadData();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transactions",
          filter: `user_id=eq.${currentUserId}`,
        },
        () => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, loadData]);


  // Handle Paystack callback reference
  useEffect(() => {
    const reference = searchParams.get("reference") || searchParams.get("trxref");
    if (!reference) return;

    let isMounted = true;
    async function verifyPayment(ref: string) {
      setVerifying(true);
      try {
        const res = await fetch(`/api/wallet/paystack/verify?reference=${encodeURIComponent(ref)}`);
        const data = await res.json();

        if (isMounted) {
          if (res.ok && data.success) {
            setVerificationResult({
              success: true,
              message: data.alreadyProcessed
                ? `Deposit already credited to your wallet.`
                : `Payment successful! ₦${(data.amount || 0).toLocaleString()} credited to your wallet.`,
            });
            await loadData();
          } else {
            setVerificationResult({
              success: false,
              message: data.error || "Could not verify payment status.",
            });
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setVerificationResult({
            success: false,
            message: err.message || "Network error while verifying payment.",
          });
        }
      } finally {
        if (isMounted) {
          setVerifying(false);
          // Clean URL without retriggering
          window.history.replaceState({}, "", "/dashboard/wallet");
        }
      }
    }

    verifyPayment(reference);

    return () => {
      isMounted = false;
    };
  }, [searchParams, loadData]);

  const filteredTxns = transactions.filter((t) => {
    if (activeTab === "inflow") return t.type === "credit" || t.type === "inflow" || t.type === "deposit";
    if (activeTab === "outflow") return t.type === "debit" || t.type === "outflow" || t.type === "purchase";
    return true;
  });

  const [balanceWhole, balanceCents] = formatNaira(balance ?? 0).split(".");

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

      {/* Verification Notification Banner */}
      {verifying && (
        <div className="p-4 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-2xl flex items-center gap-3 text-blue-800 dark:text-blue-300 text-xs font-semibold animate-pulse">
          <Loader2 className="h-5 w-5 animate-spin shrink-0 text-blue-600" />
          <span>Verifying payment with Paystack... Please wait a moment.</span>
        </div>
      )}

      {verificationResult && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs font-semibold ${
            verificationResult.success
              ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
              : "bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300"
          }`}
        >
          <div className="flex items-center gap-3">
            {verificationResult.success ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
            )}
            <span>{verificationResult.message}</span>
          </div>
          <button
            onClick={() => setVerificationResult(null)}
            className="text-xs opacity-60 hover:opacity-100 font-bold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Balance Hero Card */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-900/10 relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Available Total Balance</span>
              <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white font-mono">
              {balance === null ? (
                <span className="text-slate-500 text-2xl animate-pulse">Loading...</span>
              ) : (
                <>₦{balanceWhole}<span className="text-slate-400 text-2xl sm:text-3xl">.{balanceCents}</span></>
              )}
            </h2>
            <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 pt-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Protected by Bank-Grade 256-bit Security
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

      {/* Quick Fund Promo Card */}
      <div className="bg-gradient-to-r from-primary/10 via-indigo-500/10 to-transparent dark:from-primary/20 dark:via-indigo-500/20 dark:to-transparent rounded-3xl border border-primary/20 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-primary text-white flex items-center justify-center shrink-0 shadow-md shadow-primary/30">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white">Instant Online Wallet Funding</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Deposit instantly via Bank Transfer, Debit Cards (Visa/Mastercard), or USSD
            </p>
          </div>
        </div>
        <Link href="/dashboard/wallet/fund" className="w-full sm:w-auto">
          <Button size="sm" className="w-full sm:w-auto rounded-xl font-black text-xs h-10 px-5 shadow-sm">
            Fund Instantly
          </Button>
        </Link>
      </div>

      {/* Wallet Ledger */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="font-black text-slate-900 dark:text-white text-base">Wallet Ledger</h3>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {(["all", "inflow", "outflow"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === tab ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}>
                {tab === "all" ? "All Transactions" : tab === "inflow" ? "Deposits" : "Debits"}
              </button>
            ))}
          </div>
        </div>

        {filteredTxns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
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
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredTxns.map((item) => {
              const isCredit = item.type === "credit" || item.type === "inflow" || item.type === "deposit";
              const date = new Date(item.created_at).toLocaleDateString("en-NG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
              return (
                <div key={item.id} className="py-4 flex items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 px-2 rounded-2xl transition-colors">
                  <div className="flex items-center gap-3.5">
                    <div className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 ${isCredit ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"}`}>
                      {isCredit ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{item.description}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">{date}</span>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 rounded border border-emerald-100 dark:border-emerald-900/60">
                          {item.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm sm:text-base font-black ${isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"}`}>
                      {isCredit ? "+" : "-"}₦{formatNaira(Math.abs(item.amount))}
                    </span>
                    <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{item.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
