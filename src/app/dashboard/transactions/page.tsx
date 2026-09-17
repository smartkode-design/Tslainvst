"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Search, ArrowDownLeft, ArrowUpRight, 
  History, Plus, Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Transaction {
  id: string;
  reference: string;
  description: string;
  amount: number;
  type: string;
  status: string;
  created_at: string;
}

function formatNaira(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function TransactionsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"all" | "inflow" | "outflow">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTransactions() {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;
      if (!session) {
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setTransactions(data);
      }
      setLoading(false);
    }

    fetchTransactions();
  }, [router]);

  const filteredTransactions = transactions.filter((t) => {
    const isDeposit = t.type === "deposit" || t.type === "refund" || t.type === "bonus";
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "inflow" && isDeposit) ||
      (activeTab === "outflow" && !isDeposit);

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      t.description?.toLowerCase().includes(q) ||
      (t.reference && t.reference.toLowerCase().includes(q));

    return matchesTab && matchesSearch;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 md:pb-12 pt-2 md:pt-4 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Transactions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Complete record of your automated deposits, purchases, and wallet activity
          </p>
        </div>
        <Link href="/dashboard/wallet/fund">
          <Button className="h-11 px-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-md shadow-primary/20 flex items-center gap-1.5">
            <Plus className="h-4 w-4" /> Fund Wallet
          </Button>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by reference or service description..."
            className="pl-11 h-12 bg-white dark:bg-slate-900 rounded-2xl border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm shadow-xs"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl w-full sm:w-auto">
          {[
            { id: "all", name: "All" },
            { id: "inflow", name: "Deposits" },
            { id: "outflow", name: "Debits" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "all" | "inflow" | "outflow")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
            <p className="text-xs font-medium">Loading transactions...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <History className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No transactions recorded yet</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs">
              Deposits, orders, and wallet activity will automatically appear here.
            </p>
            <Link href="/dashboard/wallet/fund">
              <Button size="sm" className="mt-2 rounded-xl font-bold text-xs h-9 px-5">
                <Plus className="h-3.5 w-3.5 mr-1.5" /> Fund Wallet
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredTransactions.map((trx) => {
              const isDeposit = trx.type === "deposit" || trx.type === "refund" || trx.type === "bonus";
              const date = new Date(trx.created_at).toLocaleDateString("en-NG", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={trx.id}
                  className="py-4 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div
                      className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 ${
                        isDeposit
                          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {isDeposit ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-primary dark:group-hover:text-indigo-400 transition-colors">
                        {trx.description}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                          {trx.reference || trx.id.slice(0, 8)}
                        </span>
                        <span className="text-slate-300 dark:text-slate-600">·</span>
                        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">{date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pl-14 sm:pl-0">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                        trx.status === "completed"
                          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                          : trx.status === "pending"
                          ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                          : "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                      }`}
                    >
                      {trx.status}
                    </span>
                    <span
                      className={`text-base font-black font-mono ${
                        isDeposit ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"
                      }`}
                    >
                      {isDeposit ? "+" : "-"}₦{formatNaira(Math.abs(trx.amount))}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
