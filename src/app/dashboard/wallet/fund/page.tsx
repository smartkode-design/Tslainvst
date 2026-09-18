"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ShieldCheck,
  Zap,
  CreditCard,
  Building2,
  PhoneCall,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

function formatNaira(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

const PRESET_AMOUNTS = [1000, 2000, 5000, 10000, 20000, 50000];

export default function FundWalletPage() {
  const router = useRouter();
  const [balance, setBalance] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [loadingBalance, setLoadingBalance] = useState(true);

  const [amount, setAmount] = useState<number>(2000);
  const [customInput, setCustomInput] = useState<string>("2000");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;
      if (!session) {
        router.replace("/login");
        return;
      }

      const uid = session.user.id;
      setUserId(uid);
      setUserEmail(session.user.email || "");

      const [{ data: profile }, { data: wallet }] = await Promise.all([
        supabase.from("profiles").select("full_name, email").eq("id", uid).single(),
        supabase.from("wallets").select("balance").eq("user_id", uid).single(),
      ]);

      const fullName = profile?.full_name || session.user.email?.split("@")[0] || "User";
      setUserName(fullName.split(" ")[0]);
      if (profile?.email) setUserEmail(profile.email);
      setBalance(Number(wallet?.balance ?? 0));
      setLoadingBalance(false);
    }
    loadData();
  }, [router]);

  const handleSelectAmount = (val: number) => {
    setAmount(val);
    setCustomInput(String(val));
    setErrorMessage(null);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setCustomInput(val);
    const num = Number(val);
    setAmount(num);
    setErrorMessage(null);
  };

  const handlePaystackCheckout = async () => {
    if (!amount || amount < 100) {
      setErrorMessage("Minimum deposit amount is ₦100.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const res = await fetch("/api/wallet/paystack/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          amount,
          email: userEmail,
          userId,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Could not initialize payment. Please try again.");
      }

      if (data.authorizationUrl) {
        // Redirect to Paystack secure checkout
        window.location.href = data.authorizationUrl;
      } else {
        throw new Error("Missing authorization link from payment gateway.");
      }
    } catch (err: any) {
      console.error("Payment init error:", err);
      setErrorMessage(err.message || "Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

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
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Instant deposit via Bank Transfer, Debit Cards, or USSD
          </p>
        </div>
      </div>

      {/* Balance Summary Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl shadow-slate-900/10 flex items-center justify-between border border-slate-800">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Current Available Balance</span>
          <div className="text-3xl font-black tracking-tight mt-0.5 font-mono text-white">
            {loadingBalance ? (
              <span className="text-slate-500 text-xl animate-pulse">Loading...</span>
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

      {/* Primary Payment: Paystack Instant Gateway */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">Instant Online Deposit</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Funds reflect in your wallet in less than 30 seconds
              </p>
            </div>
          </div>
          <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
            Fastest
          </span>
        </div>

        {/* Amount Selection */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Select or Enter Amount (₦)
          </label>

          {/* Quick presets */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {PRESET_AMOUNTS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleSelectAmount(preset)}
                className={`py-2.5 px-3 rounded-2xl text-xs font-extrabold transition-all border ${
                  amount === preset
                    ? "bg-primary text-white border-primary shadow-md shadow-primary/20 scale-[1.02]"
                    : "bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400"
                }`}
              >
                ₦{formatNaira(preset)}
              </button>
            ))}
          </div>

          {/* Custom Amount Input */}
          <div className="relative mt-2">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-black text-lg">
              ₦
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={customInput}
              onChange={handleCustomChange}
              placeholder="e.g. 5,000"
              className="w-full h-14 pl-10 pr-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-mono font-black text-xl focus:border-primary focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
            />
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-3 rounded-xl border border-red-200 dark:border-red-800">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Accepted Payment Channels */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/60 space-y-3">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Supported Payment Methods:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
              <Building2 className="h-4 w-4 text-primary" />
              <span>Bank Transfer (Instant)</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
              <CreditCard className="h-4 w-4 text-emerald-500" />
              <span>Debit Card (Mastercard/Visa)</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
              <PhoneCall className="h-4 w-4 text-amber-500" />
              <span>USSD (All Nigerian Banks)</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={handlePaystackCheckout}
          disabled={isSubmitting || !amount || amount < 100}
          className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-sm sm:text-base shadow-lg shadow-primary/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Connecting to Secure Gateway...</span>
            </>
          ) : (
            <>
              <Zap className="h-5 w-5" />
              <span>Pay ₦{formatNaira(amount > 0 ? amount : 0)} with Paystack</span>
            </>
          )}
        </Button>
      </div>

      {/* Secondary Option: Dedicated Account (Payvessel) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <Building2 className="h-5 w-5 text-slate-400" />
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-sm">
                Permanent Dedicated Virtual Account
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                A personal 9PSB / Wema bank account permanently attached to your TSLA profile
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Clock className="h-3 w-3" /> Under Review
          </span>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-400 space-y-2">
          <p className="font-medium">
            We are finalizing our compliance integration with 9PSB/Wema Bank. Once approved, you will see your dedicated bank account number here to save in your banking app.
          </p>
          <p className="text-[11px] text-primary dark:text-indigo-400 font-bold">
            👉 In the meantime, please use the Instant Online Deposit above to fund your wallet right away.
          </p>
        </div>
      </div>

      {/* Security Trust Badge */}
      <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium pt-2">
        <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
        <span>PCI-DSS Certified 256-bit Bank-Level Encryption. Instant Automated Credit.</span>
      </div>
    </div>
  );
}
