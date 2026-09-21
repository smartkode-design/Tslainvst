"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Store, CheckCircle2, Clock, XCircle, ArrowRight,
  Loader2, ShieldCheck, Zap, Gift, AlertCircle
} from "lucide-react";
import Link from "next/link";

export default function SellerApplyPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSeller, setIsSeller] = useState(false);
  const [application, setApplication] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [reason, setReason] = useState("");
  const [socialHandles, setSocialHandles] = useState("");

  useEffect(() => {
    const init = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;
      if (!session) { router.push("/login"); return; }

      setUserId(session.user.id);

      const res = await fetch(`/api/seller/apply?userId=${session.user.id}`);
      const data = await res.json();

      if (data.isSeller) {
        setIsSeller(true);
      } else {
        setApplication(data.application);
      }
      setLoading(false);
    };
    init();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !reason.trim()) return;
    setSubmitting(true);
    setError(null);

    const { data: sessionData } = await supabase.auth.getSession();
    const profile = sessionData?.session?.user;

    const res = await fetch("/api/seller/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        fullName: profile?.user_metadata?.full_name,
        email: profile?.email,
        reason: reason.trim(),
        socialHandles: socialHandles.trim(),
      }),
    });

    const data = await res.json();
    if (data.success) {
      setApplication(data.application);
      setSuccess(true);
    } else {
      setError(data.error || "Failed to submit application");
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Already a seller
  if (isSeller) {
    return (
      <div className="max-w-lg mx-auto pt-12 px-4 text-center space-y-5">
        <div className="h-16 w-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">You're Already a Seller!</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Your account has seller access. Head to your Seller Hub to manage listings and track your earnings.
        </p>
        <Button asChild className="gap-2 rounded-xl">
          <Link href="/seller">
            <Store className="h-4 w-4" /> Go to Seller Hub <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    );
  }

  // Application pending
  if (application && application.status === "pending" && !success) {
    return (
      <div className="max-w-lg mx-auto pt-12 px-4 text-center space-y-5">
        <div className="h-16 w-16 rounded-2xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center mx-auto">
          <Clock className="h-8 w-8 text-amber-500" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Application Pending</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Your seller application is under review. We typically respond within 24 hours.
        </p>
        <Card className="text-left border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="p-4 space-y-2">
            <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Your Reason</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">{application.reason}</p>
            <p className="text-[10px] text-slate-400">
              Submitted {new Date(application.created_at).toLocaleDateString("en-NG", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </CardContent>
        </Card>
        <p className="text-xs text-slate-400">
          If approved, you'll gain instant access to your Seller Hub where you can list services and earn money.
        </p>
      </div>
    );
  }

  // Application rejected
  if (application && application.status === "rejected") {
    return (
      <div className="max-w-lg mx-auto pt-12 px-4 text-center space-y-5">
        <div className="h-16 w-16 rounded-2xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center mx-auto">
          <XCircle className="h-8 w-8 text-rose-500" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Application Not Approved</h1>
        {application.admin_note && (
          <p className="text-sm text-slate-500 dark:text-slate-400">Reason: {application.admin_note}</p>
        )}
        <p className="text-sm text-slate-500 dark:text-slate-400">
          You can re-apply with updated information.
        </p>
        <Button onClick={() => setApplication(null)} variant="outline" className="rounded-xl">
          Re-Apply
        </Button>
      </div>
    );
  }

  // Success screen
  if (success) {
    return (
      <div className="max-w-lg mx-auto pt-12 px-4 text-center space-y-5">
        <div className="h-16 w-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Application Submitted!</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          We've received your application. Our team will review and respond within 24 hours.
        </p>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  // Application form
  return (
    <div className="max-w-xl mx-auto px-4 pb-20 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3 pt-8">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <Store className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Apply to Sell on TSLA</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Become a verified merchant and list your services on TSLA Marketplace.
        </p>
      </div>

      {/* Perks */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: ShieldCheck, label: "Verified Badge", color: "text-blue-500 bg-blue-50 dark:bg-blue-950/50" },
          { icon: Zap, label: "Instant Payouts", color: "text-amber-500 bg-amber-50 dark:bg-amber-950/50" },
          { icon: Gift, label: "90% Revenue", color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50" },
        ].map(({ icon: Icon, label, color }) => (
          <div key={label} className="text-center p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className={`h-9 w-9 rounded-lg ${color} flex items-center justify-center mx-auto mb-2`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{label}</p>
          </div>
        ))}
      </div>

      {/* Form */}
      <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-base font-black text-slate-900 dark:text-white">Seller Application</CardTitle>
          <p className="text-xs text-slate-500">Tell us about yourself and what you plan to sell.</p>
        </CardHeader>
        <CardContent className="p-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Why do you want to sell on TSLA? *
              </label>
              <Textarea
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. I have aged social media accounts I want to sell. I have experience in account trading and want a trusted platform..."
                className="min-h-[120px] text-sm resize-none rounded-xl border-slate-200 dark:border-slate-700"
                maxLength={500}
              />
              <p className="text-[11px] text-slate-400 text-right">{reason.length}/500</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Social Handles (optional)
              </label>
              <Input
                value={socialHandles}
                onChange={(e) => setSocialHandles(e.target.value)}
                placeholder="e.g. @yourhandle on Twitter/Instagram, Telegram username"
                className="rounded-xl text-sm border-slate-200 dark:border-slate-700"
              />
              <p className="text-[11px] text-slate-400">
                Helps us verify your identity. Not required but recommended.
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 p-3 rounded-xl">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting || !reason.trim()}
              className="w-full h-12 rounded-xl font-bold gap-2"
            >
              {submitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
              ) : (
                <><Store className="h-4 w-4" /> Submit Application</>
              )}
            </Button>

            <p className="text-[11px] text-center text-slate-400">
              By applying you agree to TSLA's seller terms. Platform fee is 10% per sale.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
