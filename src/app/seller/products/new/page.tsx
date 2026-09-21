"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft, CheckCircle2, Loader2, AlertCircle,
  Eye, EyeOff, KeyRound, User, Mail, Phone, FileText, Lock
} from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "twitter", label: "Twitter / X" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "gmail", label: "Gmail" },
  { value: "google_voice", label: "Google Voice" },
  { value: "other", label: "Other" },
];

export default function AddListingPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [show2FA, setShow2FA] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("facebook");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  // Credentials
  const [credUsername, setCredUsername] = useState("");
  const [credEmail, setCredEmail] = useState("");
  const [credPassword, setCredPassword] = useState("");
  const [credTwoFactor, setCredTwoFactor] = useState("");
  const [credRecoveryEmail, setCredRecoveryEmail] = useState("");
  const [credPhone, setCredPhone] = useState("");
  const [credNotes, setCredNotes] = useState("");

  useEffect(() => {
    const init = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;
      if (!session) { router.push("/login"); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (!profile || profile.role !== "seller") {
        router.push("/dashboard/seller-apply");
        return;
      }

      setUserId(session.user.id);
      setLoading(false);
    };
    init();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    if (!credUsername && !credEmail) {
      setError("Please provide at least a username OR email for this account.");
      return;
    }

    if (!credPassword) {
      setError("Password is required.");
      return;
    }

    const priceNum = Number(price);
    if (isNaN(priceNum) || priceNum < 100) {
      setError("Price must be at least ₦100.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const credentials: Record<string, string> = {};
    if (credUsername) credentials.username = credUsername.trim();
    if (credEmail) credentials.email = credEmail.trim();
    if (credPassword) credentials.password = credPassword.trim();
    if (credTwoFactor) credentials.two_factor = credTwoFactor.trim();
    if (credRecoveryEmail) credentials.recovery_email = credRecoveryEmail.trim();
    if (credPhone) credentials.phone = credPhone.trim();
    if (credNotes) credentials.notes = credNotes.trim();

    // Add display metadata
    credentials.platform = CATEGORIES.find((c) => c.value === category)?.label || category;
    credentials.displayCategory = CATEGORIES.find((c) => c.value === category)?.label || category;

    const res = await fetch("/api/seller/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        title: title.trim(),
        category,
        description: description.trim(),
        priceNgn: priceNum,
        credentials,
      }),
    });

    const data = await res.json();
    if (data.success) {
      setSuccess(true);
    } else {
      setError(data.error || "Failed to create listing. Please try again.");
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

  if (success) {
    return (
      <div className="max-w-md mx-auto pt-16 text-center space-y-5">
        <div className="h-16 w-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Listing Live! 🎉</h1>
        <p className="text-sm text-muted-foreground">
          Your listing is now visible on the TSLA Marketplace. Buyers can purchase it instantly.
        </p>
        <div className="flex gap-3 justify-center">
          <Button asChild variant="outline" className="rounded-xl font-bold">
            <Link href="/seller/listings">View Listings</Link>
          </Button>
          <Button onClick={() => { setSuccess(false); setTitle(""); setCredUsername(""); setCredEmail(""); setCredPassword(""); setCredTwoFactor(""); setCredRecoveryEmail(""); setCredPhone(""); setCredNotes(""); setDescription(""); setPrice(""); }} className="rounded-xl font-bold">
            Add Another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-20 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 pt-2">
        <Button asChild variant="ghost" size="sm" className="rounded-xl">
          <Link href="/seller"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-xl font-black tracking-tight">New Listing</h1>
          <p className="text-xs text-muted-foreground">List a service or account on TSLA Marketplace</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Details */}
        <Card>
          <CardHeader className="pb-4 border-b border-border/50">
            <CardTitle className="text-base font-black">Basic Details</CardTitle>
            <CardDescription className="text-xs">What are you selling?</CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs font-bold uppercase tracking-wider">
                Listing Title *
              </Label>
              <Input
                id="title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Aged Facebook Account 2018 — USA"
                className="rounded-xl text-sm"
                maxLength={100}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-xs font-bold uppercase tracking-wider">
                  Platform / Category *
                </Label>
                <select
                  id="category"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-background border border-input text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className="text-xs font-bold uppercase tracking-wider">
                  Price (₦) *
                </Label>
                <Input
                  id="price"
                  type="number"
                  required
                  min="100"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 3500"
                  className="rounded-xl text-sm font-mono font-bold"
                />
                {price && Number(price) >= 100 && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    You earn: ₦{(Number(price) * 0.9).toLocaleString()} (90% after 10% platform fee)
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider">
                Description (optional)
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Aged 2018 Facebook account, US profile, followers: 120, never banned..."
                className="rounded-xl text-sm resize-none min-h-[80px]"
                maxLength={300}
              />
            </div>
          </CardContent>
        </Card>

        {/* Credentials */}
        <Card>
          <CardHeader className="pb-4 border-b border-border/50">
            <CardTitle className="text-base font-black">Account Credentials</CardTitle>
            <CardDescription className="text-xs">
              These are delivered instantly to the buyer after payment. Fill in as many fields as apply.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cred-username" className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" /> Username / Login
                </Label>
                <Input
                  id="cred-username"
                  value={credUsername}
                  onChange={(e) => setCredUsername(e.target.value)}
                  placeholder="e.g. john.smith"
                  className="rounded-xl text-sm font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cred-email" className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> Email Address
                </Label>
                <Input
                  id="cred-email"
                  type="text"
                  value={credEmail}
                  onChange={(e) => setCredEmail(e.target.value)}
                  placeholder="e.g. john@example.com"
                  className="rounded-xl text-sm font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cred-password" className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" /> Password *
              </Label>
              <div className="relative">
                <Input
                  id="cred-password"
                  required
                  type={showPassword ? "text" : "password"}
                  value={credPassword}
                  onChange={(e) => setCredPassword(e.target.value)}
                  placeholder="Account password"
                  className="rounded-xl text-sm font-mono pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cred-2fa" className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5" /> 2FA Code / Secret Key
                <span className="text-[10px] font-normal text-muted-foreground normal-case">(if applicable)</span>
              </Label>
              <div className="relative">
                <Input
                  id="cred-2fa"
                  type={show2FA ? "text" : "password"}
                  value={credTwoFactor}
                  onChange={(e) => setCredTwoFactor(e.target.value)}
                  placeholder="e.g. TOTP secret or backup codes"
                  className="rounded-xl text-sm font-mono pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShow2FA(!show2FA)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {show2FA ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cred-recovery" className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> Recovery Email
                </Label>
                <Input
                  id="cred-recovery"
                  value={credRecoveryEmail}
                  onChange={(e) => setCredRecoveryEmail(e.target.value)}
                  placeholder="e.g. recovery@gmail.com"
                  className="rounded-xl text-sm font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cred-phone" className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> Phone Number Linked
                </Label>
                <Input
                  id="cred-phone"
                  value={credPhone}
                  onChange={(e) => setCredPhone(e.target.value)}
                  placeholder="e.g. +1 555 000 0000"
                  className="rounded-xl text-sm font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cred-notes" className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" /> Extra Notes for Buyer
              </Label>
              <Textarea
                id="cred-notes"
                value={credNotes}
                onChange={(e) => setCredNotes(e.target.value)}
                placeholder="e.g. Account verified with ID, do not change email within 30 days..."
                className="rounded-xl text-sm resize-none min-h-[70px]"
                maxLength={500}
              />
            </div>

            {/* Preview */}
            {(credUsername || credEmail) && credPassword && (
              <div className="p-3 rounded-xl bg-muted/50 border border-border/60 space-y-1">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Buyer will receive:</p>
                {credUsername && <p className="text-xs font-mono">Username: {credUsername}</p>}
                {credEmail && <p className="text-xs font-mono">Email: {credEmail}</p>}
                <p className="text-xs font-mono">Password: ••••••••</p>
                {credTwoFactor && <p className="text-xs font-mono">2FA: ••••••••</p>}
                {credRecoveryEmail && <p className="text-xs font-mono">Recovery: {credRecoveryEmail}</p>}
                {credPhone && <p className="text-xs font-mono">Phone: {credPhone}</p>}
                {credNotes && <p className="text-xs font-mono">Notes: {credNotes}</p>}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 p-3 rounded-xl">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-3">
          <Button asChild variant="outline" className="flex-1 rounded-xl font-bold">
            <Link href="/seller">Cancel</Link>
          </Button>
          <Button
            type="submit"
            disabled={submitting || !title || !price || !credPassword || (!credUsername && !credEmail)}
            className="flex-1 rounded-xl font-bold h-12 gap-2"
          >
            {submitting
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Publishing...</>
              : "Publish Listing 🚀"
            }
          </Button>
        </div>

        <p className="text-[11px] text-center text-muted-foreground">
          Platform fee: 10% per sale. You earn 90% of the listing price, credited instantly to your wallet.
        </p>
      </form>
    </div>
  );
}
