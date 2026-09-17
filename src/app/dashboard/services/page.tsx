"use client";

import Link from "next/link";
import { 
  Zap, Globe, Store, ShieldCheck, Smartphone, Wifi, Tv, Flame, 
  ChevronRight, ArrowUpRight, Sparkles, CheckCircle2 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ServicesHubPage() {
  const serviceCategories = [
    {
      title: "Telecom & Identity",
      badge: "Instant Delivery",
      services: [
        {
          name: "Virtual Numbers (SMS OTP)",
          desc: "Instant SMS OTP for Google Voice, Signal, WhatsApp, Telegram, OpenAI & 20+ apps.",
          href: "/dashboard/services/virtual-no",
          icon: Globe,
          color: "from-pink-500 to-rose-600",
          shadow: "shadow-pink-500/20",
          price: "From ₦850"
        },
        {
          name: "Buy Logs (Verified Accounts)",
          desc: "Facebook 2FA aged accounts, NordVPN, ChatGPT Plus, Discord tokens.",
          href: "/marketplace",
          icon: Store,
          color: "from-amber-500 to-orange-600",
          shadow: "shadow-orange-500/20",
          price: "From ₦850"
        },
      ]
    },
    {
      title: "Growth & Reseller Business",
      badge: "High Revenue",
      services: [
        {
          name: "Boost Socials (SMM Panel)",
          desc: "Guaranteed followers, likes, views and comments across all major platforms.",
          href: "/dashboard/services/boost-socials",
          icon: Zap,
          color: "from-purple-500 to-indigo-600",
          shadow: "shadow-purple-500/20",
          price: "From ₦1,200 / 1k"
        },
        {
          name: "Affiliate Website (White Label)",
          desc: "Launch your own branded VTU & digital assets platform connected to our APIs.",
          href: "/dashboard/services/affiliate-site",
          icon: ShieldCheck,
          color: "from-blue-600 to-indigo-700",
          shadow: "shadow-blue-500/20",
          price: "From ₦320,000"
        },
      ]
    },
    {
      title: "Daily Utilities & Bills",
      badge: "Zero Fee",
      services: [
        {
          name: "Buy Airtime",
          desc: "Instant airtime recharge with 2% cashback for MTN, Airtel, Glo, 9mobile.",
          href: "/dashboard/services/buy-airtime",
          icon: Smartphone,
          color: "from-blue-500 to-cyan-500",
          shadow: "shadow-blue-500/20",
          price: "2% Discount"
        },
        {
          name: "Buy Data Bundles",
          desc: "SME, Corporate & Gifting data bundles with 30-day validity.",
          href: "/dashboard/services/buy-data",
          icon: Wifi,
          color: "from-emerald-500 to-teal-600",
          shadow: "shadow-emerald-500/20",
          price: "From ₦250 / GB"
        },
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24 md:pb-12 pt-2 md:pt-4 px-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Services Hub</h1>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
          Explore all automated digital services, SMM growth tools, and white-label products.
        </p>
      </div>

      {/* Categories */}
      <div className="space-y-8">
        {serviceCategories.map((cat, idx) => (
          <div key={idx} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{cat.title}</h2>
              <span className="text-[10px] font-black uppercase tracking-wider text-primary dark:text-indigo-400 bg-primary/10 dark:bg-primary/20 px-2.5 py-1 rounded-full">
                {cat.badge}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cat.services.map((srv, srvIdx) => (
                <Link key={srvIdx} href={srv.href}>
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs hover:shadow-lg hover:border-primary/40 dark:hover:border-primary/60 transition-all duration-300 flex items-start gap-4 group cursor-pointer h-full">
                    <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${srv.color} p-[1px] shadow-sm shrink-0 group-hover:scale-105 transition-transform ${srv.shadow}`}>
                      <div className="w-full h-full bg-white/20 dark:bg-slate-950/20 rounded-[0.95rem] flex items-center justify-center backdrop-blur-md">
                        <srv.icon className="h-6 w-6 text-white" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-primary dark:group-hover:text-indigo-400 transition-colors">
                          {srv.name}
                        </h3>
                        <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-900/50">
                          {srv.price}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-2">
                        {srv.desc}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
