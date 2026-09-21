"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Search, Eye, EyeOff, Store, Zap, Globe, 
  ShoppingBag, Loader2, ArrowRight, ExternalLink
} from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Order {
  id: string;
  service_type: string;
  service_name: string;
  target?: string;
  quantity?: number;
  amount_ngn: number;
  status: string;
  otp_code?: string;
  details?: Record<string, unknown>;
  created_at: string;
}

function formatNaira(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function getServiceIcon(type: string) {
  switch (type) {
    case "sms":
      return { icon: Globe, color: "text-pink-500 bg-pink-50 dark:bg-pink-950/60" };
    case "smm":
      return { icon: Zap, color: "text-purple-500 bg-purple-50 dark:bg-purple-950/60" };
    case "log":
      return { icon: Store, color: "text-amber-500 bg-amber-50 dark:bg-amber-950/60" };
    default:
      return { icon: Store, color: "text-blue-500 bg-blue-50 dark:bg-blue-950/60" };
  }
}

function getStatusStyle(status: string) {
  switch (status) {
    case "completed":
      return "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
    case "processing":
    case "in_progress":
      return "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800";
    case "pending":
      return "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800";
    default:
      return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";
  }
}

export default function OrdersPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [revealedLogs, setRevealedLogs] = useState<Record<string, boolean>>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;
      if (!session) {
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setOrders(data);

        // Auto-sync processing SMM orders with provider network
        const hasProcessingSmm = data.some(
          (o: any) => o.service_type === "smm" && (o.status === "processing" || o.status === "pending")
        );
        if (hasProcessingSmm) {
          fetch("/api/services/smm/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: session.user.id }),
          })
            .then((res) => res.json())
            .then((syncRes) => {
              if (syncRes.synced > 0) {
                supabase
                  .from("orders")
                  .select("*")
                  .eq("user_id", session.user.id)
                  .order("created_at", { ascending: false })
                  .then(({ data: refreshed }) => {
                    if (refreshed) setOrders(refreshed);
                  });
              }
            })
            .catch(() => {});
        }
      }
      setLoading(false);
    }

    fetchOrders();
  }, [router]);

  const toggleReveal = (id: string) => {
    setRevealedLogs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredOrders = orders.filter((ord) => {
    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "logs" && ord.service_type === "log") ||
      (activeFilter === "smm" && ord.service_type === "smm") ||
      (activeFilter === "virtual" && ord.service_type === "sms");

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      ord.service_name?.toLowerCase().includes(q) ||
      ord.id?.toLowerCase().includes(q) ||
      (ord.target && ord.target.toLowerCase().includes(q));

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 md:pb-12 pt-2 md:pt-4 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Order History</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">Track your social boosts, purchased accounts, and digital assets</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl w-full sm:w-auto overflow-x-auto">
          {[
            { id: "all", name: "All" },
            { id: "logs", name: "Buy Logs" },
            { id: "smm", name: "SMM Boost" },
            { id: "virtual", name: "Virtual No." },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeFilter === tab.id 
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs" 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
        <Input 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by Order ID or Service name..." 
          className="pl-11 h-12 bg-white dark:bg-slate-900 rounded-2xl border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm shadow-xs"
        />
      </div>

      {/* Orders List Cards */}
      <div className="space-y-3.5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
            <p className="text-xs font-medium">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6">
            <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No orders placed yet</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs">
              When you purchase virtual numbers, social boosts, or logs, they will appear here.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <Link href="/dashboard/services">
                <Button size="sm" className="rounded-xl font-bold text-xs h-9 px-4">
                  Explore Services <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button size="sm" variant="outline" className="rounded-xl font-bold text-xs h-9 px-4">
                  Browse Logs
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const { icon: Icon, color: iconColor } = getServiceIcon(order.service_type);
            const isRevealed = revealedLogs[order.id];
            const date = new Date(order.created_at).toLocaleDateString("en-NG", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div 
                key={order.id} 
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 ${iconColor}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{order.id.slice(0, 8).toUpperCase()}</span>
                        <span className="text-slate-300 dark:text-slate-700">·</span>
                        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">{date}</span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">{order.service_name}</h3>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800">
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${getStatusStyle(order.status)}`}>
                      {order.status}
                    </span>
                    <span className="text-base font-black text-slate-900 dark:text-white font-mono">₦{formatNaira(order.amount_ngn)}</span>
                  </div>
                </div>

                {/* Delivery Box / OTP / Target Info */}
                {(order.target || order.otp_code || order.details) && (
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200/70 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="font-mono text-slate-700 dark:text-slate-300 break-all w-full">
                      {order.service_type === "log" && !isRevealed ? (
                        "••••••••••••••••••••••••••••••••••••••••••••"
                      ) : order.service_type === "smm" ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-sans font-bold text-slate-500 text-[11px] uppercase tracking-wider">Target:</span>
                            <a
                              href={order.target?.startsWith("http") ? order.target : `https://${order.target}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary hover:underline font-mono inline-flex items-center gap-1 font-bold"
                            >
                              {order.target} <ExternalLink className="h-3 w-3 inline shrink-0" />
                            </a>
                            {order.quantity && (
                              <span className="font-sans font-semibold text-slate-400 dark:text-slate-500 text-xs">
                                ({order.quantity.toLocaleString()} units)
                              </span>
                            )}
                          </div>
                          {(order.status === "processing" || order.status === "pending") && (
                            <p className="font-sans text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                              ⚡ Queued with network · Delivery typically commences within 15–60 mins.
                            </p>
                          )}
                        </div>
                      ) : order.otp_code ? (
                        `OTP: ${order.otp_code} | Target: ${order.target || "N/A"}`
                      ) : order.target ? (
                        `Target: ${order.target}`
                      ) : (
                        JSON.stringify(order.details || {})
                      )}
                    </div>

                    {order.service_type === "log" && (
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => toggleReveal(order.id)}
                        className="h-8 px-3 rounded-xl text-[11px] font-bold shrink-0 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                      >
                        {isRevealed ? <EyeOff className="h-3.5 w-3.5 mr-1" /> : <Eye className="h-3.5 w-3.5 mr-1" />}
                        {isRevealed ? "Hide Credentials" : "View Credentials"}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
