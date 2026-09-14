"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  User, Shield, Lock, Bell, Smartphone, ArrowLeft, Check, 
  ChevronRight, KeyRound, LogOut, CheckCircle2, ShieldAlert 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function SettingsPage() {
  const router = useRouter();
  const [pinSaved, setPinSaved] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-primary/20">
      {/* Top Navbar */}
      <div className="bg-white border-b border-slate-200/80 sticky top-0 z-30 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-extrabold text-slate-900 text-base">Account Settings</h1>
          <Link href="/dashboard" className="text-xs font-bold text-primary">Done</Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6 pb-24">
        {/* User Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-primary/20">
            OA
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-black text-slate-900">Oluwaseun Aliyu</h2>
            <p className="text-xs text-slate-500 font-medium">oluwaseun@example.com · +234 812 345 6789</p>
            <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Tier-2 Verified Member
            </span>
          </div>
        </div>

        {/* Security & 4-Digit PIN */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <KeyRound className="h-5 w-5 text-primary" />
            <h3 className="font-black text-slate-900 text-sm tracking-wide">Transaction Security PIN</h3>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Your 4-digit PIN is required to authorize purchases, wallet withdrawals, and digital asset orders.
            </p>
            <div className="flex gap-2 max-w-xs">
              <Input 
                type="password"
                maxLength={4}
                defaultValue="4892"
                className="h-12 rounded-2xl bg-slate-50 border-slate-200 font-mono text-center text-xl tracking-widest font-black text-slate-900"
              />
              <Button 
                onClick={() => {
                  setPinSaved(true);
                  setTimeout(() => setPinSaved(false), 2000);
                }}
                className="h-12 px-5 rounded-2xl bg-slate-900 text-white hover:bg-primary font-bold text-xs shrink-0"
              >
                {pinSaved ? "Saved!" : "Update PIN"}
              </Button>
            </div>
          </div>
        </div>

        {/* App Preferences */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Shield className="h-5 w-5 text-primary" />
            <h3 className="font-black text-slate-900 text-sm tracking-wide">Security & Preferences</h3>
          </div>

          <div className="divide-y divide-slate-100">
            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">Two-Factor Authentication (2FA)</p>
                <p className="text-xs text-slate-500 font-medium">Protect your account with SMS or Google Authenticator</p>
              </div>
              <button 
                onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${twoFactorEnabled ? "bg-primary" : "bg-slate-300"}`}
              >
                <div className={`h-5 w-5 rounded-full bg-white transition-transform ${twoFactorEnabled ? "translate-x-6" : "translate-x-0"}`} />
              </button>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">Instant Order Alerts</p>
                <p className="text-xs text-slate-500 font-medium">Receive WhatsApp and Email alerts for completed orders</p>
              </div>
              <button className="w-12 h-6 rounded-full bg-primary relative p-0.5">
                <div className="h-5 w-5 rounded-full bg-white translate-x-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="pt-2">
          <Link href="/login">
            <Button variant="outline" className="w-full h-12 rounded-2xl border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-bold text-xs flex items-center justify-center gap-2">
              <LogOut className="h-4 w-4" /> Sign Out of TSLA
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
