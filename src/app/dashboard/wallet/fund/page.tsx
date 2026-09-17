"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, AlertTriangle, Building2, Hash, User, ShieldCheck, Clock, Loader2, Zap
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

function formatNaira(amount: number): string {
  return new Intl.NumberFormat("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
}

export default function FundWalletPage() {
  const router = useRouter();
  const [balance, setBalance] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [loadingBalance, setLoadingBalance] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;
      if (!session) { router.replace("/login"); return; }

      const userId = session.user.id;
      const [{ data: profile }, { data: wallet }] = await Promise.all([
        supabase.from("profiles").select("full_name").eq("id", userId).single(),
        supabase.from("wallets").select("balance").eq("user_id", userId).single(),
      ]);

      const fullName = profile?.full_name || session.user.email?.split("@")[0] || "User";
      setUserName(fullName.split(" ")[0]);
      setBalance(Number(wallet?.balance ?? 0));
      setLoadingBalance(false);
    }
    loadData();
  }, [router]);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24 md:pb-12 pt-2 md:pt-4 px-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="h-10 w-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-slate-700 dark:text-slate-200" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Fund Wallet</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Automatic instant deposit via dedicated virtual account</p>
        </div>
      </div>

      {/* Real Balance Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl p-6 shadow-lg shadow-blue-900/10 flex items-center justify-between border border-blue-800/60">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-200">Current Balance</span>
          <div className="text-3xl font-black tracking-tight mt-0.5 font-mono">
            {loadingBalance ? (
              <span className="text-blue-300 text-xl animate-pulse">Loading...</span>
            ) : (
              <>₦{formatNaira(balance ?? 0)}</>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-bold text-emerald-300">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Active
        </div>
      </div>

      {/* Payment Gateway Setup Notice */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-amber-200 dark:border-amber-800/60 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center">
            <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-900 dark:text-white">Payvessel Integration — Setup In Progress</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Your dedicated virtual account will appear here once configured</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800 text-amber-800 dark:text-amber-300 rounded-2xl text-xs font-medium">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>The deposit gateway is currently being set up. Your dedicated bank account details will appear here shortly.</span>
        </div>

        {/* Preview of what it will look like - greyed out */}
        <div className="space-y-3 opacity-40 pointer-events-none select-none">
          <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-xs">
                <Building2 className="h-5 w-5 text-slate-400" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bank Name</p>
                <p className="text-sm font-black text-slate-500">— Pending —</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-xs">
                <Hash className="h-5 w-5 text-slate-400" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account Number</p>
                <p className="text-base font-black text-slate-500 font-mono tracking-widest">•••• •••• ••</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-xs">
                <User className="h-5 w-5 text-slate-400" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account Name</p>
                <p className="text-sm font-black text-slate-500">
                  {userName ? `TSLA - ${userName}` : "TSLA - Your Name"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-medium pt-1">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Awaiting Payvessel API configuration by administrator...
        </div>
      </div>

      {/* How it will work */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">How funding will work</h3>
        <div className="space-y-3">
          {[
            "A permanent virtual bank account (Palmpay / Paga) will be assigned to your account.",
            "Copy your 10-digit account number.",
            "Transfer any amount from any Nigerian bank app (OPay, Kuda, GTB, Zenith, etc.).",
            "Your TSLA wallet balance will update automatically within 30 seconds.",
          ].map((step, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="h-5 w-5 rounded-full bg-primary/10 dark:bg-primary/20 text-primary dark:text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Security note */}
      <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-medium px-1">
        <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
        All deposits are protected by bank-grade 256-bit encryption. Zero processing fee on direct bank transfers.
      </div>
    </div>
  );
}
