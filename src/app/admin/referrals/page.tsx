"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Gift, 
  Users, 
  Wallet, 
  Percent, 
  RefreshCw, 
  Award, 
  ShieldCheck,
  TrendingUp
} from "lucide-react";

interface AdminReferralsData {
  stats: {
    totalCommissionsPaidNgn: number;
    totalCommissionsCount: number;
    totalAffiliatesCount: number;
    activeRatePercent: number;
  };
  leaderboard: Array<{
    id: string;
    name: string;
    email: string;
    code: string;
    invitedCount: number;
    totalEarnedNgn: number;
  }>;
  recentCommissions: Array<{
    id: string;
    referrerName: string;
    referrerEmail: string;
    refereeName: string;
    amountNgn: number;
    depositAmountNgn: number;
    reference: string;
    date: string;
  }>;
}

export default function AdminReferralsPage() {
  const [data, setData] = useState<AdminReferralsData | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/referrals");
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load admin referrals:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Gift className="h-7 w-7 text-primary" /> Referral Network & Affiliates
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Audit affiliate payouts, top promoter rankings, and referral commission flow.
          </p>
        </div>

        <Button
          onClick={loadData}
          variant="outline"
          size="sm"
          className="h-10 px-4 rounded-xl border-slate-200 dark:border-slate-800 font-bold text-xs flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <CardContent className="p-5 flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Commissions Paid</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                ₦{data?.stats.totalCommissionsPaidNgn.toLocaleString() ?? "0"}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <CardContent className="p-5 flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Payout Events</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                {data?.stats.totalCommissionsCount ?? 0}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <CardContent className="p-5 flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Promoters</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                {data?.stats.totalAffiliatesCount ?? 0}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <CardContent className="p-5 flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <Percent className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Commission Rate</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">5.0%</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid: Top Promoters Leaderboard + Live Commission Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Top Promoters */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" /> Top Promoters Leaderboard
            </h3>
            <span className="text-[10px] font-bold uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">
              Rankings
            </span>
          </div>

          {!data?.leaderboard || data.leaderboard.length === 0 ? (
            <div className="py-10 text-center text-xs font-bold text-slate-400">
              No promoters with referral activity yet.
            </div>
          ) : (
            <div className="space-y-2.5">
              {data.leaderboard.slice(0, 10).map((user, idx) => (
                <div key={user.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="h-7 w-7 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center font-black text-xs shrink-0">
                      #{idx + 1}
                    </span>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-[10px] font-mono text-slate-400 truncate">{user.code}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                      ₦{user.totalEarnedNgn.toLocaleString()}
                    </p>
                    <p className="text-[10px] font-semibold text-slate-400">
                      {user.invitedCount} invited
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Commissions Feed */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-500" /> Recent Payout Transactions
            </h3>
            <span className="text-[10px] font-bold text-slate-400">5% Auto-Credit</span>
          </div>

          {!data?.recentCommissions || data.recentCommissions.length === 0 ? (
            <div className="py-10 text-center text-xs font-bold text-slate-400">
              No referral commission transactions recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="pb-2.5">Date</th>
                    <th className="pb-2.5">Referrer</th>
                    <th className="pb-2.5">From Friend</th>
                    <th className="pb-2.5 text-right">Commission (₦)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {data.recentCommissions.map((comm) => (
                    <tr key={comm.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-3 text-slate-500">
                        {new Date(comm.date).toLocaleDateString("en-NG", {
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="py-3 font-bold text-slate-900 dark:text-white">
                        {comm.referrerName}
                      </td>
                      <td className="py-3 text-slate-600 dark:text-slate-300">
                        {comm.refereeName}
                      </td>
                      <td className="py-3 text-right font-black text-emerald-600 dark:text-emerald-400">
                        +₦{comm.amountNgn.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
