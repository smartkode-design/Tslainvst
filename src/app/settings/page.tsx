"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { KeyRound, LogOut, CheckCircle2, Shield, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { supabase } from "@/lib/supabase/client";

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function SettingsPage() {
  const router = useRouter();
  const [pinSaved, setPinSaved] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [user, setUser] = useState<{
    full_name: string;
    email: string;
    phone: string;
    initials: string;
  } | null>(null);

  useEffect(() => {
    async function loadUser() {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;
      if (!session) { router.replace("/login"); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email, phone")
        .eq("id", session.user.id)
        .single();

      const fullName = profile?.full_name || session.user.email?.split("@")[0] || "User";
      setUser({
        full_name: fullName,
        email: profile?.email || session.user.email || "",
        phone: profile?.phone || "",
        initials: getInitials(fullName),
      });
    }
    loadUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080c14] text-slate-900 dark:text-slate-100 selection:bg-primary/20 transition-colors duration-200">
      {/* Top Navbar */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-30 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="h-10 w-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-extrabold text-slate-900 dark:text-white text-base">Account Settings</h1>
          <Link href="/dashboard" className="text-xs font-bold text-primary dark:text-indigo-400">Done</Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6 pb-24">
        {/* User Card - Real Data */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-primary/20 shrink-0">
            {user?.initials ?? "…"}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-black text-slate-900 dark:text-white truncate">
              {user?.full_name ?? "Loading..."}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
              {user?.email ?? ""}
              {user?.phone ? ` · ${user.phone}` : ""}
            </p>
            <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Active Member
            </span>
          </div>
        </div>

        {/* Transaction PIN */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <KeyRound className="h-5 w-5 text-primary dark:text-indigo-400" />
            <h3 className="font-black text-slate-900 dark:text-white text-sm tracking-wide">Transaction Security PIN</h3>
          </div>
          <div className="space-y-3">
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Your 4-digit PIN is required to authorize purchases and digital asset orders.
            </p>
            <div className="flex gap-2 max-w-xs">
              <Input
                type="password"
                maxLength={4}
                placeholder="••••"
                className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-mono text-center text-xl tracking-widest font-black text-slate-900 dark:text-white"
              />
              <Button
                onClick={() => { setPinSaved(true); setTimeout(() => setPinSaved(false), 2000); }}
                className="h-12 px-5 rounded-2xl bg-slate-900 dark:bg-slate-700 text-white hover:bg-primary font-bold text-xs shrink-0"
              >
                {pinSaved ? "Saved!" : "Update PIN"}
              </Button>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Shield className="h-5 w-5 text-primary dark:text-indigo-400" />
            <h3 className="font-black text-slate-900 dark:text-white text-sm tracking-wide">Security & Preferences</h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Appearance Theme</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Switch between light and dark themes</p>
              </div>
              <ThemeToggle />
            </div>
            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Two-Factor Authentication (2FA)</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Protect your account with SMS or Google Authenticator</p>
              </div>
              <button
                onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${twoFactorEnabled ? "bg-primary" : "bg-slate-300 dark:bg-slate-700"}`}
              >
                <div className={`h-5 w-5 rounded-full bg-white transition-transform ${twoFactorEnabled ? "translate-x-6" : "translate-x-0"}`} />
              </button>
            </div>
            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Instant Order Alerts</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Receive WhatsApp and Email alerts for completed orders</p>
              </div>
              <button className="w-12 h-6 rounded-full bg-primary relative p-0.5">
                <div className="h-5 w-5 rounded-full bg-white translate-x-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="pt-2">
          <button
            onClick={handleLogout}
            className="w-full h-12 rounded-2xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="h-4 w-4" /> Sign Out of TSLA
          </button>
        </div>
      </div>
    </div>
  );
}
