"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowLeft, Copy, Check, AlertTriangle, Building2, Hash, User, 
  Clock, ShieldCheck, CreditCard, ChevronRight, RefreshCw, Zap
} from "lucide-react";

export default function FundWalletPage() {
  const router = useRouter();
  const [selectedGateway, setSelectedGateway] = useState<"paga" | "palmpay" | "bachs">("palmpay");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [bachsTimer, setBachsTimer] = useState(3540); // 59 mins

  useEffect(() => {
    const timer = setInterval(() => {
      setBachsTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24 md:pb-12 pt-2 md:pt-4 px-4">
      {/* Top Header */}
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

      {/* Balance Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl p-6 shadow-lg shadow-blue-900/10 flex items-center justify-between border border-blue-800/60">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-200">Current Balance</span>
          <div className="text-3xl font-black tracking-tight mt-0.5">₦248,500.00</div>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-bold text-emerald-300">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Active
        </div>
      </div>

      {/* Fee Alert */}
      <div className="flex items-center gap-3 p-4 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800 text-amber-800 dark:text-amber-300 rounded-2xl text-xs font-medium">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
        <span>A processing fee of <strong>₦0</strong> will be deducted from your deposit. Zero fee on Palmpay transfers!</span>
      </div>

      {/* Gateway Selector Tabs */}
      <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl">
        <button
          onClick={() => setSelectedGateway("palmpay")}
          className={`py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
            selectedGateway === "palmpay"
              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <div className="h-2 w-2 rounded-full bg-purple-600" />
          Palmpay
        </button>
        <button
          onClick={() => setSelectedGateway("paga")}
          className={`py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
            selectedGateway === "paga"
              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <div className="h-2 w-2 rounded-full bg-blue-600" />
          Paga
        </button>
        <button
          onClick={() => setSelectedGateway("bachs")}
          className={`py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
            selectedGateway === "bachs"
              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Zap className="h-3 w-3 text-amber-500" />
          Bachs Dynamic
        </button>
      </div>

      {/* Virtual Account Details Cards */}
      {selectedGateway !== "bachs" ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Permanent Dedicated Account
            </span>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-900/60">
              Instant Auto-Credit
            </span>
          </div>

          {/* Bank Name */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700 text-primary dark:text-indigo-400 shadow-xs">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Bank Name</p>
                <p className="text-sm font-black text-slate-900 dark:text-white">
                  {selectedGateway === "palmpay" ? "Palmpay" : "Paga (Monnify)"}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard(selectedGateway === "palmpay" ? "Palmpay" : "Paga", "bank")}
              className="h-8 px-3 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              {copiedField === "bank" ? <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
              <span className="ml-1.5">{copiedField === "bank" ? "Copied" : "Copy"}</span>
            </Button>
          </div>

          {/* Account Number */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 shadow-xs">
                <Hash className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Account Number</p>
                <p className="text-base font-black text-slate-900 dark:text-white font-mono tracking-wider">
                  {selectedGateway === "palmpay" ? "8920194821" : "3871401491"}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard(selectedGateway === "palmpay" ? "8920194821" : "3871401491", "account")}
              className="h-8 px-3 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              {copiedField === "account" ? <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
              <span className="ml-1.5">{copiedField === "account" ? "Copied" : "Copy"}</span>
            </Button>
          </div>

          {/* Account Name */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Account Name</p>
                <p className="text-sm font-black text-slate-900 dark:text-white">TSLA - Oluwaseun A.</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard("TSLA - Oluwaseun A.", "name")}
              className="h-8 px-3 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              {copiedField === "name" ? <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
              <span className="ml-1.5">{copiedField === "name" ? "Copied" : "Copy"}</span>
            </Button>
          </div>
        </div>
      ) : (
        /* Bachs 60-Minute Dynamic Checkout */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-primary/30 dark:border-primary/40 p-6 shadow-lg shadow-primary/5 space-y-5 animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
              <span className="text-xs font-black text-slate-900 dark:text-white">Bachs Dynamic Checkout</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-200/50 dark:border-amber-800/60">
              <Clock className="h-3.5 w-3.5" />
              <span>Expires in {formatTimer(bachsTimer)}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-3">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Transfer exactly</p>
            <div className="text-3xl font-black text-slate-900 dark:text-white">₦5,000.00</div>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">To the one-time bank account details below:</p>

            <div className="pt-2 space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="font-semibold text-slate-500 dark:text-slate-400">Bank Name</span>
                <span className="font-black text-slate-900 dark:text-white">Bank78 MFB</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="font-semibold text-slate-500 dark:text-slate-400">Account Number</span>
                <div className="flex items-center gap-2">
                  <span className="font-black text-base text-slate-900 dark:text-white font-mono tracking-wider">7540159105</span>
                  <button onClick={() => copyToClipboard("7540159105", "bachs")} className="text-primary dark:text-indigo-400 hover:underline text-xs font-bold">
                    {copiedField === "bachs" ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="font-semibold text-slate-500 dark:text-slate-400">Account Name</span>
                <span className="font-black text-slate-900 dark:text-white">Bachs Checkout - TSLA</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/40 rounded-xl text-[11px] font-semibold text-rose-700 dark:text-rose-300">
            ⚠️ Do not save or reuse this account number. It expires automatically after this session.
          </div>
        </div>
      )}

      {/* Instructions Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          How to fund your wallet
        </h3>
        <div className="space-y-3">
          {[
            "Select your preferred virtual bank provider above.",
            "Copy the 10-digit account number.",
            "Open your banking app (OPay, Kuda, GTB, Zenith, etc.) and transfer any amount.",
            "Your TSLA wallet balance will update automatically within 30 seconds."
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
    </div>
  );
}
