"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { 
  ShieldCheck, Smartphone, Copy, Check, Clock, 
  RefreshCw, CheckCircle2, AlertCircle, Sparkles, ExternalLink 
} from "lucide-react";
import { Button } from "@/components/ui/button";

function getServiceIcon(serviceName: string) {
  const s = (serviceName || "").toLowerCase();
  if (s.includes("whatsapp")) return { name: "WhatsApp", icon: "💬", color: "from-emerald-500 to-green-600" };
  if (s.includes("telegram")) return { name: "Telegram", icon: "✈️", color: "from-sky-400 to-blue-600" };
  if (s.includes("google") || s.includes("voice")) return { name: "Google", icon: "🔴", color: "from-red-500 to-amber-500" };
  if (s.includes("instagram")) return { name: "Instagram", icon: "📸", color: "from-fuchsia-500 to-rose-600" };
  if (s.includes("facebook")) return { name: "Facebook", icon: "📘", color: "from-blue-600 to-indigo-700" };
  if (s.includes("twitter") || s.includes("x")) return { name: "Twitter / X", icon: "🐦", color: "from-slate-800 to-slate-950" };
  if (s.includes("tiktok")) return { name: "TikTok", icon: "🎵", color: "from-slate-900 to-slate-800" };
  if (s.includes("tinder")) return { name: "Tinder", icon: "🔥", color: "from-rose-500 to-orange-500" };
  if (s.includes("openai") || s.includes("chatgpt")) return { name: "OpenAI / ChatGPT", icon: "🤖", color: "from-teal-600 to-emerald-700" };
  return { name: serviceName || "Online Service", icon: "🌐", color: "from-primary to-indigo-600" };
}

export default function PublicVerifyPage() {
  const params = useParams();
  const token = typeof params?.token === "string" ? params.token : "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<{
    phone: string;
    service: string;
    status: "WAITING" | "RECEIVED" | "CANCELED";
    code: string | null;
    smsText: string | null;
    expiresInSeconds: number;
    createdAt: string;
  } | null>(null);

  const [copiedNumber, setCopiedNumber] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [countdown, setCountdown] = useState<number>(0);
  const [isCanceling, setIsCanceling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Fetch status
  const pollOrder = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`/api/services/sms/public-order?token=${token}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Verification session not found or link has expired.");
        setLoading(false);
        return;
      }

      setOrderData(data);
      if (typeof data.expiresInSeconds === "number") {
        setCountdown(data.expiresInSeconds);
      }
      setLoading(false);
    } catch (err: any) {
      console.error("Poll error:", err);
    }
  }, [token]);

  const handleReportBanned = async () => {
    setIsCanceling(true);
    try {
      const res = await fetch(`/api/services/sms/public-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, reason: "Customer reported number banned" }),
      });
      const data = await res.json();
      if (data.success) {
        setShowCancelModal(false);
        await pollOrder();
      } else {
        alert(data.error || "Failed to cancel line");
      }
    } catch (err: any) {
      alert(err.message || "Failed to cancel line");
    } finally {
      setIsCanceling(false);
    }
  };

  // Initial load
  useEffect(() => {
    pollOrder();
  }, [pollOrder]);

  // Polling loop while waiting
  useEffect(() => {
    if (!orderData || orderData.status !== "WAITING") return;

    const interval = setInterval(() => {
      pollOrder();
    }, 3000);

    return () => clearInterval(interval);
  }, [orderData, pollOrder]);

  // Local seconds countdown
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleCopy = (text: string, type: "number" | "code") => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (type === "number") {
      setCopiedNumber(true);
      setTimeout(() => setCopiedNumber(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const formatCountdown = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? "0" : ""}${s}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <div className="h-14 w-14 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary animate-pulse mb-4">
          <RefreshCw className="h-7 w-7 animate-spin" />
        </div>
        <p className="text-sm font-bold text-slate-300">Connecting to Verification Line...</p>
        <p className="text-xs text-slate-500 mt-1">Please hold on</p>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4 shadow-2xl">
          <div className="h-16 w-16 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-black">Link Expired or Not Found</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {error || "This verification link is invalid, timed out, or has already completed its session."}
          </p>
          <div className="pt-2">
            <p className="text-[11px] text-slate-500">
              Please contact your vendor to request a fresh virtual line link.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const serviceInfo = getServiceIcon(orderData.service);
  const isReceived = orderData.status === "RECEIVED";
  const isCanceled = orderData.status === "CANCELED";
  const isWaiting = orderData.status === "WAITING";

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col items-center justify-between p-4 sm:p-6 selection:bg-primary/30">
      
      {/* Top Escrow Badge */}
      <header className="w-full max-w-lg flex items-center justify-between py-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <span className="text-xs font-black tracking-tight text-white">TSLA Customer Portal</span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live Line
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-lg my-auto py-4 space-y-5">
        
        {/* Service Header Card */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${serviceInfo.color} flex items-center justify-center text-2xl shadow-lg shrink-0`}>
                {serviceInfo.icon}
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Service</span>
                <h1 className="text-lg font-black text-white leading-tight">{orderData.service}</h1>
              </div>
            </div>
            {isWaiting && (
              <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl text-amber-400 text-xs font-mono font-bold shrink-0">
                <Clock className="h-3.5 w-3.5" />
                <span>{formatCountdown(countdown)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Dedicated Phone Number Card */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4 text-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
            Your Dedicated Phone Number
          </span>

          <div className="text-3xl sm:text-4xl font-black font-mono tracking-wider text-white py-1">
            {orderData.phone}
          </div>

          <Button
            onClick={() => handleCopy(orderData.phone, "number")}
            className="w-full h-12 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-black text-xs shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 border-0"
          >
            {copiedNumber ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-slate-700" />}
            <span>{copiedNumber ? "Number Copied!" : "Copy Phone Number"}</span>
          </Button>

          <p className="text-[11px] text-slate-400">
            Paste this number in your app and request your verification code.
          </p>
        </div>

        {/* Dynamic Status Display Box */}
        {isWaiting && (
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-7 text-center space-y-4 relative overflow-hidden">
            {/* Ambient Pulsing Radar */}
            <div className="relative mx-auto h-16 w-16 flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-30"></span>
              <div className="relative h-14 w-14 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary">
                <RefreshCw className="h-7 w-7 animate-spin duration-1000" />
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-white">Listening for Incoming SMS...</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                As soon as your app sends the SMS, your code will automatically appear on this screen.
              </p>
            </div>

            {/* Quick 3-step Instructions */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 text-left space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <span className="h-5 w-5 rounded-full bg-primary/20 text-primary font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                <span>Copy the phone number above.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="h-5 w-5 rounded-full bg-primary/20 text-primary font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                <span>Open your app (e.g. {serviceInfo.name}) and paste the number.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="h-5 w-5 rounded-full bg-primary/20 text-primary font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                <span>Tap <strong>Send SMS / Verify</strong> and keep this page open.</span>
              </div>
            </div>

            {/* Banned Number Helper */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                  App says number is banned?
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  If {serviceInfo.name} blocked this number, cancel now. Your vendor receives an instant 100% refund so they can issue you a replacement number.
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                disabled={isCanceling}
                onClick={() => setShowCancelModal(true)}
                className="rounded-xl text-xs font-bold bg-rose-600/90 hover:bg-rose-600 text-white shrink-0 self-start sm:self-auto h-9"
              >
                Report Banned / Cancel
              </Button>
            </div>
          </div>
        )}

        {/* RECEIVED / CODE ARRIVED */}
        {isReceived && (
          <div className="bg-gradient-to-b from-emerald-950/40 to-slate-900 border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-7 text-center space-y-5 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>SMS Code Received!</span>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Your Verification Code
              </span>
              <div className="text-4xl sm:text-5xl font-black font-mono tracking-widest text-emerald-400 py-2">
                {orderData.code || "------"}
              </div>
            </div>

            <Button
              onClick={() => handleCopy(orderData.code || "", "code")}
              className="w-full h-13 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/25 transition-transform active:scale-95 flex items-center justify-center gap-2 border-0"
            >
              {copiedCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copiedCode ? "Code Copied!" : "Copy Verification Code"}</span>
            </Button>

            {orderData.smsText && (
              <div className="bg-slate-950/80 border border-emerald-900/40 rounded-2xl p-3 text-left">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Full SMS Message:</p>
                <p className="text-xs text-slate-300 font-mono leading-relaxed break-words">{orderData.smsText}</p>
              </div>
            )}
          </div>
        )}

        {/* CANCELED OR TIMED OUT */}
        {isCanceled && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-7 text-center space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto">
              <AlertCircle className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-white">Line Canceled & Vendor Refunded</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                This number has been released and your vendor was issued an instant 100% refund in their TSLA wallet balance.
              </p>
            </div>
            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-left text-xs space-y-2 text-slate-300">
              <p className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                No Money Lost · Guaranteed
              </p>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Please contact your vendor to request a fresh number. (Tip: For Telegram, asking for UK, Netherlands, South Africa, or Brazil gives the cleanest success rate!)
              </p>
            </div>
          </div>
        )}

        {/* MODAL: REPORT BANNED / CANCEL CONFIRMATION */}
        {showCancelModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95">
              <div className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-base font-bold text-white">Cancel & Refund Vendor?</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Does {serviceInfo.name} show this number is banned? Canceling will immediately refund your vendor 100% of their money so they can generate a replacement line for you.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isCanceling}
                  onClick={() => setShowCancelModal(false)}
                  className="rounded-xl border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Go Back
                </Button>
                <Button
                  size="sm"
                  disabled={isCanceling}
                  onClick={handleReportBanned}
                  className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  {isCanceling ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Confirm Cancel"}
                </Button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full max-w-lg text-center py-4 border-t border-slate-900 space-y-1">
        <p className="text-[11px] font-semibold text-slate-500">
          Secured by TSLA Verification Portal
        </p>
        <p className="text-[10px] text-slate-600">
          Instant Carrier Routing · No Account Required for Clients
        </p>
      </footer>

    </div>
  );
}
