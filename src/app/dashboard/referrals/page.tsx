"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/dashboard/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Gift, 
  Copy, 
  Check, 
  Share2, 
  Users, 
  Wallet, 
  Percent, 
  ArrowUpRight, 
  MessageCircle, 
  Sparkles, 
  ShieldCheck, 
  HelpCircle,
  Clock
} from "lucide-react";

interface ReferralStats {
  code: string;
  ratePercent: number;
  stats: {
    totalReferred: number;
    totalEarnedNgn: number;
    commissionCount: number;
  };
  referredFriends: Array<{
    id: string;
    name: string;
    email: string;
    joinedAt: string;
  }>;
  recentCommissions: Array<{
    id: string;
    amount: number;
    description: string;
    refereeName: string;
    depositAmount: number;
    date: string;
    reference: string;
  }>;
}

export default function ReferralsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<"earnings" | "friends">("earnings");

  useEffect(() => {
    if (!user?.id) return;

    async function loadStats() {
      try {
        const res = await fetch(`/api/referrals/stats?userId=${user?.id}`);
        const json = await res.json();
        if (json.success) {
          setData(json);
        }
      } catch (err) {
        console.error("Failed to load referral stats:", err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [user?.id]);

  const referralCode = data?.code || (user ? `TSLA-${user.firstName.toUpperCase()}-${user.id.slice(0, 4).toUpperCase()}` : "TSLA-VIP");
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://tslainvst.com";
  const referralLink = `${siteUrl}/register?ref=${referralCode}`;

  const copyToClipboard = (text: string, type: "code" | "link") => {
    navigator.clipboard.writeText(text);
    if (type === "code") {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(
      `Hey! Get instant WhatsApp & Telegram virtual numbers and social media boosting on TSLA. Sign up with my link and get started: ${referralLink}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 p-6 sm:p-10 border border-indigo-500/20 shadow-xl text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-[90px] pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold text-indigo-300">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>TSLA Affiliate Network</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Invite Friends, Earn <span className="bg-gradient-to-r from-amber-300 to-yellow-500 bg-clip-text text-transparent">5% Forever</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
            Share your personal referral code. Whenever your invited friends fund their TSLA wallet, <strong>5% of their deposit</strong> is automatically credited into your wallet balance instantly.
          </p>
        </div>
      </div>

      {/* Share Section Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Code & Link Card */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" /> Your Referral Code & Link
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Give this code to your friends or share your invite link directly on social media.
            </p>
          </div>

          {/* Referral Code Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
              Referral Code
            </span>
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-xl sm:text-2xl font-black tracking-widest text-primary dark:text-indigo-400 select-all">
                {referralCode}
              </span>
              <Button
                onClick={() => copyToClipboard(referralCode, "code")}
                variant="outline"
                size="sm"
                className="h-10 px-4 rounded-xl border-slate-300 dark:border-slate-700 font-bold text-xs flex items-center gap-2 bg-white dark:bg-slate-800"
              >
                {copiedCode ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                <span>{copiedCode ? "Copied!" : "Copy Code"}</span>
              </Button>
            </div>
          </div>

          {/* Referral Link Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
              Direct Referral Link
            </span>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-300 truncate select-all">
                {referralLink}
              </span>
              <Button
                onClick={() => copyToClipboard(referralLink, "link")}
                variant="outline"
                size="sm"
                className="h-10 px-4 rounded-xl border-slate-300 dark:border-slate-700 font-bold text-xs flex items-center justify-center gap-2 shrink-0 bg-white dark:bg-slate-800"
              >
                {copiedLink ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                <span>{copiedLink ? "Copied Link!" : "Copy Link"}</span>
              </Button>
            </div>
          </div>

          {/* WhatsApp Quick Share */}
          <Button
            onClick={shareOnWhatsApp}
            className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Share on WhatsApp</span>
            <ArrowUpRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {/* Right: Quick Stats Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          <Card className="rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Users className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Friends Invited</p>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                  {loading ? "..." : (data?.stats.totalReferred ?? 0)}
                </h3>
                <p className="text-[11px] font-semibold text-slate-400 mt-0.5">Signed up with your code</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Wallet className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Commissions Earned</p>
                <h3 className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  ₦{loading ? "..." : (data?.stats.totalEarnedNgn ?? 0).toLocaleString()}
                </h3>
                <p className="text-[11px] font-semibold text-slate-400 mt-0.5">Credited directly to wallet</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <Percent className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Commission Rate</p>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">5%</h3>
                <p className="text-[11px] font-semibold text-slate-400 mt-0.5">Paid on every wallet deposit</p>
              </div>
            </CardContent>
          </Card>

        </div>

      </div>

      {/* Activity Section: Tabs for Commissions & Friends */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Referral Activity
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live audit of your earnings and friends who used your code.
            </p>
          </div>

          <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab("earnings")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "earnings"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Commissions ({data?.recentCommissions.length ?? 0})
            </button>
            <button
              onClick={() => setActiveTab("friends")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "friends"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Invited Friends ({data?.referredFriends.length ?? 0})
            </button>
          </div>
        </div>

        {/* Tab 1: Commissions Table */}
        {activeTab === "earnings" && (
          <div>
            {loading ? (
              <div className="py-12 text-center text-xs font-bold text-slate-400">Loading commissions...</div>
            ) : !data?.recentCommissions || data.recentCommissions.length === 0 ? (
              <div className="py-14 text-center space-y-3">
                <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <Gift className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">No commissions yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  When a friend registers with your code and funds their wallet, your 5% bonus will appear here automatically!
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Invited Friend</th>
                      <th className="pb-3">Deposit Amount</th>
                      <th className="pb-3">Your 5% Commission</th>
                      <th className="pb-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {data.recentCommissions.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-4 text-slate-500">
                          {new Date(c.date).toLocaleDateString("en-NG", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-4 font-bold text-slate-900 dark:text-white">
                          {c.refereeName}
                        </td>
                        <td className="py-4 font-medium text-slate-600 dark:text-slate-300">
                          ₦{c.depositAmount ? c.depositAmount.toLocaleString() : "—"}
                        </td>
                        <td className="py-4 font-black text-emerald-600 dark:text-emerald-400">
                          +₦{c.amount.toLocaleString()}
                        </td>
                        <td className="py-4 text-right">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                            <ShieldCheck className="h-3 w-3" /> Credited
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Friends Table */}
        {activeTab === "friends" && (
          <div>
            {loading ? (
              <div className="py-12 text-center text-xs font-bold text-slate-400">Loading friends...</div>
            ) : !data?.referredFriends || data.referredFriends.length === 0 ? (
              <div className="py-14 text-center space-y-3">
                <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <Users className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">No friends registered yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Share your link with WhatsApp groups, Telegram channels, and friends to start growing your earnings!
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                      <th className="pb-3">Joined Date</th>
                      <th className="pb-3">Name</th>
                      <th className="pb-3">Account Email</th>
                      <th className="pb-3 text-right">Referral Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {data.referredFriends.map((f) => (
                      <tr key={f.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-4 text-slate-500">
                          {new Date(f.joinedAt).toLocaleDateString("en-NG", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-4 font-bold text-slate-900 dark:text-white">
                          {f.name}
                        </td>
                        <td className="py-4 font-mono text-slate-600 dark:text-slate-300">
                          {f.email}
                        </td>
                        <td className="py-4 text-right">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>

      {/* FAQ / How it Works Card */}
      <div className="rounded-3xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-primary" /> Frequently Asked Questions
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="space-y-1.5">
            <p className="font-bold text-slate-800 dark:text-slate-200">How do I receive my commissions?</p>
            <p className="text-slate-500 leading-relaxed">
              Commissions are credited straight into your TSLA wallet balance in real-time as soon as Payvessel or Paystack confirms your friend's deposit.
            </p>
          </div>
          <div className="space-y-1.5">
            <p className="font-bold text-slate-800 dark:text-slate-200">Can I use my earnings immediately?</p>
            <p className="text-slate-500 leading-relaxed">
              Yes! Your referral balance is active cash in your wallet. You can use it to buy virtual numbers for WhatsApp, order social media boosts, or withdraw.
            </p>
          </div>
          <div className="space-y-1.5">
            <p className="font-bold text-slate-800 dark:text-slate-200">Is there any limit to how much I can earn?</p>
            <p className="text-slate-500 leading-relaxed">
              There is absolutely no cap! The more friends, agencies, or resellers you invite, the more passive 5% commissions you earn every single month.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
