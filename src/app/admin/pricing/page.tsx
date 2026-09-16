"use client";

import { useState, useEffect } from "react";
import { 
  DollarSign, Save, RefreshCw, CheckCircle2, TrendingUp, Globe, 
  Smartphone, Zap, AlertCircle, ShieldCheck, ArrowRight, Percent, Sliders
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DEFAULT_PRICING, PricingItem } from "@/lib/pricing";

export default function AdminPricingPage() {
  const [pricing, setPricing] = useState<PricingItem[]>(DEFAULT_PRICING);
  const [activeTab, setActiveTab] = useState<"sms" | "country" | "smm">("sms");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load live pricing from API
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const res = await fetch("/api/admin/pricing");
        const data = await res.json();
        if (data.success && data.pricing) {
          setPricing(data.pricing);
        }
      } catch (err) {
        console.error("Failed to load pricing", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPricing();
  }, []);

  // Update specific item price
  const handlePriceChange = (id: string, newPrice: string) => {
    const numericPrice = parseInt(newPrice) || 0;
    setPricing((prev) =>
      prev.map((item) => (item.id === id ? { ...item, retailNGN: numericPrice } : item))
    );
    setSaveSuccess(false);
  };

  // Toggle active state
  const handleToggleActive = (id: string) => {
    setPricing((prev) =>
      prev.map((item) => (item.id === id ? { ...item, active: !item.active } : item))
    );
    setSaveSuccess(false);
  };

  // Save changes to backend
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pricing }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch (err) {
      console.error("Failed to save pricing", err);
    } finally {
      setIsSaving(false);
    }
  };

  const currentItems = pricing.filter((p) => p.category === activeTab);

  // Calculate totals for metrics
  const totalProfitSum = pricing.reduce(
    (acc, curr) => acc + (curr.retailNGN - curr.wholesaleEstNGN),
    0
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Top Header & Save Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-6 w-6 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-indigo-400">
              <Sliders className="h-3.5 w-3.5" />
            </span>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Service Price Mapping & Profit Margins
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Customize retail Naira selling prices in real time. Changes take effect on user dashboards immediately.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setPricing(DEFAULT_PRICING)}
            variant="outline"
            size="sm"
            className="text-xs font-bold border-slate-200 dark:border-slate-800"
          >
            Reset Defaults
          </Button>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-md shadow-primary/20 gap-2 h-10 px-5 rounded-xl"
          >
            {isSaving ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : saveSuccess ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saveSuccess ? "Saved Successfully!" : "Save All Prices"}
          </Button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {saveSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-2xl flex items-center justify-between animate-in fade-in duration-300">
          <div className="flex items-center gap-2 text-xs font-bold">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>All pricing changes have been saved to your database and are live on the user frontend!</span>
          </div>
          <span className="text-[10px] font-mono uppercase bg-emerald-500/20 px-2 py-0.5 rounded">Active</span>
        </div>
      )}

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                Total Configured Services
              </p>
              <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{pricing.length}</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">10 SMS Apps · 6 Countries · 5 SMM</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/50 dark:border-indigo-800/40 flex items-center justify-center text-primary dark:text-indigo-400">
              <Smartphone className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                Average Margin Multiplier
              </p>
              <h4 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">2.8x – 5.8x</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Over 200% average net profit</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/50 dark:border-emerald-800/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                Live Wholesale Engine
              </p>
              <h4 className="text-xl font-black text-slate-900 dark:text-white mt-1">5SIM & JAP</h4>
              <p className="text-[10px] text-emerald-500 font-bold mt-0.5 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> Auto-deduct active
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200/50 dark:border-sky-800/40 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <Zap className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab("sms")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "sms"
              ? "bg-primary text-white shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
          }`}
        >
          <Smartphone className="h-4 w-4" />
          Virtual Numbers (Target Apps: WhatsApp, GV, Signal)
        </button>

        <button
          onClick={() => setActiveTab("country")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "country"
              ? "bg-primary text-white shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
          }`}
        >
          <Globe className="h-4 w-4" />
          Country Routing Rates (+1, +234, +44, etc.)
        </button>

        <button
          onClick={() => setActiveTab("smm")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "smm"
              ? "bg-primary text-white shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
          }`}
        >
          <Zap className="h-4 w-4" />
          Social Media Boosting (JAP Services)
        </button>
      </div>

      {/* Pricing Mapping Table / Cards */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div>
            <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              {activeTab === "sms" && "Target SMS Verification Apps Pricing"}
              {activeTab === "country" && "Country Route Base Rates"}
              {activeTab === "smm" && "SMM Follower, Like & View Boost Pricing"}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Type the retail Naira price your customer will be charged.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400">
            {currentItems.length} Services Listed
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {currentItems.map((item) => {
            const profit = item.retailNGN - item.wholesaleEstNGN;
            const markupPercent = item.wholesaleEstNGN > 0 ? Math.round((profit / item.wholesaleEstNGN) * 100) : 0;

            return (
              <div
                key={item.id}
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
              >
                {/* Left: Service Details */}
                <div className="flex items-center gap-3.5 min-w-[220px]">
                  <div className="h-11 w-11 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl shrink-0">
                    {item.icon || (item.code ? "🏳️" : "⚡")}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                      {item.name}
                      {item.id === "sms_googlevoice" && (
                        <span className="text-[9px] font-extrabold uppercase bg-indigo-50 dark:bg-indigo-950/60 text-primary dark:text-indigo-400 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800/50">
                          Hot High-Ticket
                        </span>
                      )}
                      {item.id === "sms_signal" && (
                        <span className="text-[9px] font-extrabold uppercase bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/50">
                          Encrypted
                        </span>
                      )}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>Wholesale: <strong>${item.wholesaleUSD.toFixed(3)}</strong> (~₦{item.wholesaleEstNGN.toLocaleString()})</span>
                      <span>·</span>
                      <span className="capitalize">{item.unitLabel}</span>
                    </div>
                  </div>
                </div>

                {/* Center: Live Profit & Margin Indicator */}
                <div className="flex items-center gap-3 md:justify-center">
                  <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 px-3.5 py-1.5 rounded-xl text-center">
                    <p className="text-[9px] uppercase font-bold text-emerald-700 dark:text-emerald-300">Your Clean Profit</p>
                    <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      +₦{profit.toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl text-center hidden sm:block">
                    <p className="text-[9px] uppercase font-bold text-slate-400">Markup</p>
                    <p className="text-xs font-black text-slate-700 dark:text-slate-300 font-mono">
                      +{markupPercent}%
                    </p>
                  </div>
                </div>

                {/* Right: Editable Selling Price Input & Status */}
                <div className="flex items-center gap-3 self-end md:self-auto">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-500 dark:text-slate-400">₦</span>
                    <Input
                      type="number"
                      value={item.retailNGN}
                      onChange={(e) => handlePriceChange(item.id, e.target.value)}
                      className="w-28 h-10 text-right font-black font-mono text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>

                  <Button
                    onClick={() => handleToggleActive(item.id)}
                    variant="ghost"
                    size="sm"
                    className={`h-9 px-3 rounded-xl text-xs font-bold ${
                      item.active
                        ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                        : "text-slate-400 bg-slate-100 dark:bg-slate-800"
                    }`}
                  >
                    {item.active ? "Active" : "Disabled"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Save Bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Click <strong>Save All Prices</strong> above or below to commit all your edits.
          </span>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-primary hover:bg-primary/90 text-white font-bold text-xs h-9 px-4 rounded-xl gap-2"
          >
            {isSaving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save All Prices
          </Button>
        </div>
      </div>
    </div>
  );
}
