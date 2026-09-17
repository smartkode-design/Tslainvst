"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Search, Filter, Globe, ShoppingBag, Check, Copy, ShieldCheck, 
  Zap, X, LayoutGrid, List, AlertCircle, ArrowRight, ExternalLink, 
  Sparkles, Plus, Minus, CheckCircle2, ChevronRight 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

interface Product {
  id: number;
  flag: string;
  country: string;
  stock: number;
  platform: string;
  category: string;
  title: string;
  priceNum: number;
  price: string;
  details: string;
}

export default function MarketplacePage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  // Buy Checkout Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [buyQuantity, setBuyQuantity] = useState(1);
  const [isProcessingBuy, setIsProcessingBuy] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const [copiedCreds, setCopiedCreds] = useState(false);

  // Fetch real wallet balance
  useEffect(() => {
    async function fetchBalance() {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;
      if (!session) return;
      const { data: wallet } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", session.user.id)
        .single();
      setWalletBalance(Number(wallet?.balance ?? 0));
    }
    fetchBalance();
  }, []);



  const categories = [
    { name: "All", icon: "🔥", count: 1840 },
    { name: "Google Voice", icon: "📞", count: 76 },
    { name: "Facebook", icon: "📘", count: 420 },
    { name: "VPNs", icon: "🛡️", count: 190 },
    { name: "Google / Gmail", icon: "🔴", count: 512 },
    { name: "Discord", icon: "💬", count: 140 },
    { name: "AI Accounts", icon: "🤖", count: 95 },
    { name: "Instagram", icon: "📸", count: 210 },
    { name: "Twitter / X", icon: "🐦", count: 185 },
    { name: "TikTok", icon: "🎵", count: 88 },
  ];

  const products: Product[] = [
    {
      id: 201,
      flag: "https://flagcdn.com/w640/us.png",
      country: "United States",
      stock: 48,
      platform: "GOOGLE VOICE",
      category: "Google Voice",
      title: "Google Voice (+1 USA) Aged 2023 · Clean IP + Gmail + Recovery",
      priceNum: 5500,
      price: "₦5,500",
      details: "Gmail: gvoice_us992@gmail.com | Pass: Voice!2026Secure | Recovery: recov92@outlook.com | Voice#: +1 (415) 890-4122 | 2FA: JBSWY3DPEHPK3PXP"
    },
    {
      id: 202,
      flag: "https://flagcdn.com/w640/us.png",
      country: "United States",
      stock: 28,
      platform: "GOOGLE VOICE",
      category: "Google Voice",
      title: "Google Voice (+1 USA Fresh) · High Carrier Trust + Full Access",
      priceNum: 4200,
      price: "₦4,200",
      details: "Gmail: gv_fresh01@gmail.com | Pass: Fresh!Voice2026 | Recovery: fresh_rec@outlook.com | Voice#: +1 (646) 773-8910"
    },
    {
      id: 1,
      flag: "https://flagcdn.com/w640/au.png",
      country: "Australia",
      stock: 82,
      platform: "FACEBOOK",
      category: "Facebook",
      title: "Facebook 2FA (Aged 90+ Days) · Hotmail Verified",
      priceNum: 3680,
      price: "₦3,680",
      details: "Email: au_user991@hotmail.com | Pass: AusPass!2026 | 2FA: JBSWY3DPEHPK3PXP"
    },
    {
      id: 2,
      flag: "https://flagcdn.com/w640/kr.png",
      country: "South Korea",
      stock: 1009,
      platform: "FACEBOOK",
      category: "Facebook",
      title: "Facebook 2FA (Aged 1-2 Years) · Korean IP with Cookies",
      priceNum: 4500,
      price: "₦4,500",
      details: "Email: kim.minjun91@hotmail.com | Pass: K0r3a#Sec!2026 | 2FA: JBSWY3DPEHPK3PXP"
    },
    {
      id: 3,
      flag: "https://flagcdn.com/w640/eu.png",
      country: "European Union",
      stock: 1579,
      platform: "FACEBOOK",
      category: "Facebook",
      title: "Facebook Europe IP (Aged 90+ Days) · Outlook Access",
      priceNum: 3680,
      price: "₦3,680",
      details: "Email: eu_trade44@outlook.com | Pass: Eur0!2026Secure | 2FA: 4B6K2P7Q9X1Y3Z5"
    },
    {
      id: 4,
      flag: "https://flagcdn.com/w640/us.png",
      country: "United States",
      stock: 440,
      platform: "VPNS",
      category: "VPNs",
      title: "NordVPN Premium (1 Year) · Auto-Renew on 6 Devices",
      priceNum: 2150,
      price: "₦2,150",
      details: "User: tech_streamer@gmail.com | Pass: N0rd!Sec991 | Exp: Sep 2027"
    },
    {
      id: 5,
      flag: "https://flagcdn.com/w640/gb.png",
      country: "United Kingdom",
      stock: 688,
      platform: "AI ACCOUNTS",
      category: "AI Accounts",
      title: "ChatGPT Plus (1 Month) · GPT-4o Dedicated Account",
      priceNum: 15000,
      price: "₦15,000",
      details: "Email: gpt_pro_user@tsla.mail | Pass: OpenAi#99182 | Full Email Access"
    },
    {
      id: 6,
      flag: "https://flagcdn.com/w640/ca.png",
      country: "Canada",
      stock: 32,
      platform: "DISCORD",
      category: "Discord",
      title: "Discord Token (1 Year Old) · Fully Verified Nitro Ready",
      priceNum: 850,
      price: "₦850",
      details: "Token: mfa.Njk3ODkzOTk4OTAyNzIwOTk1.G2fK9A.4B8C1D9E7F5A3"
    },
    {
      id: 7,
      flag: "https://flagcdn.com/w640/hk.png",
      country: "Hong Kong",
      stock: 1894,
      platform: "FACEBOOK",
      category: "Facebook",
      title: "Facebook HK IP (Aged 6+ Months) · 2FA Ads Manager Active",
      priceNum: 4200,
      price: "₦4,200",
      details: "Email: hk_ads_pro@gmail.com | Pass: HK#AdManager2026 | 2FA: 9A8B7C6D5E4F"
    },
    {
      id: 8,
      flag: "https://flagcdn.com/w640/de.png",
      country: "Germany",
      stock: 512,
      platform: "GOOGLE / GMAIL",
      category: "Google / Gmail",
      title: "Gmail Aged (2022) · German IP Clean History & Recovery",
      priceNum: 1800,
      price: "₦1,800",
      details: "Email: klaus.weber22@gmail.com | Pass: D3utsch!P4ss | Recovery: rec_tsla@yahoo.com"
    },
    {
      id: 9,
      flag: "https://flagcdn.com/w640/us.png",
      country: "United States",
      stock: 320,
      platform: "INSTAGRAM",
      category: "Instagram",
      title: "Instagram Aged PVA (2021) · Real Bio & Clean USA IP",
      priceNum: 2400,
      price: "₦2,400",
      details: "User: usa_creator_99 | Pass: Insta#Pva2026 | Mail: ig_us99@hotmail.com"
    },
    {
      id: 10,
      flag: "https://flagcdn.com/w640/us.png",
      country: "United States",
      stock: 180,
      platform: "TWITTER / X",
      category: "Twitter / X",
      title: "Twitter / X Aged (2020) · Instant Login Phone Verified",
      priceNum: 3500,
      price: "₦3,500",
      details: "User: @x_verified_20 | Pass: Tw!tt3rSec | AuthToken: e7b19a820c8f"
    },
    {
      id: 11,
      flag: "https://flagcdn.com/w640/gb.png",
      country: "United Kingdom",
      stock: 94,
      platform: "TIKTOK",
      category: "TikTok",
      title: "TikTok 1k+ Followers · Live Stream Studio Enabled",
      priceNum: 8500,
      price: "₦8,500",
      details: "User: @uk_trends_live | Pass: T!kTokLive2026 | Mail: uk_live@outlook.com"
    },
    {
      id: 12,
      flag: "https://flagcdn.com/w640/us.png",
      country: "United States",
      stock: 215,
      platform: "VPNS",
      category: "VPNs",
      title: "ExpressVPN Premium Account (1 Year) · Multi-Device",
      priceNum: 2800,
      price: "₦2,800",
      details: "User: vpn_stream@gmail.com | Pass: Exp!Sec2026 | Code: 991820"
    }
  ];

  const filteredProducts = products.filter(product => {
    const matchesCategory = activeCategory === "All" || product.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.country.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenBuy = (product: Product) => {
    setSelectedProduct(product);
    setBuyQuantity(1);
    setPurchaseComplete(false);
    setCopiedCreds(false);
  };

  const handleConfirmPurchase = () => {
    setIsProcessingBuy(true);
    setTimeout(() => {
      setIsProcessingBuy(false);
      setPurchaseComplete(true);
    }, 1200);
  };

  const handleCopyCredentials = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCreds(true);
    setTimeout(() => setCopiedCreds(false), 2000);
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-28 md:pb-12 max-w-7xl mx-auto px-1 sm:px-4">
      {/* Header (Clean, High-Converting Mobile & Desktop Header) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Buy Logs
            </h1>
            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">
              SocialVault
            </span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
            Instant automated delivery of aged 2FA social accounts, VPNs, and tokens
          </p>
        </div>

        {/* Live Wallet & Guarantee Ticker */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 shrink-0">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Wallet: {walletBalance === null ? "Loading..." : `₦${new Intl.NumberFormat("en-NG", { minimumFractionDigits: 2 }).format(walletBalance)}`}</span>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 shrink-0">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span>24h Replacement</span>
          </div>
        </div>
      </div>

      {/* Search, Filter & View Mode Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search accounts, countries, platforms..." 
            className="pl-10 pr-4 h-11 sm:h-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs sm:text-sm rounded-xl sm:rounded-2xl shadow-xs focus-visible:ring-primary/20 focus-visible:border-primary"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs font-bold"
            >
              Clear
            </button>
          )}
        </div>

        {/* View Mode Switcher (Grid vs List on mobile) */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "grid" 
                ? "bg-white dark:bg-slate-700 text-primary dark:text-white shadow-xs" 
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
            title="Grid View"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "list" 
                ? "bg-white dark:bg-slate-700 text-primary dark:text-white shadow-xs" 
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
            title="List View"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Category Pills (Horizontal Native Scroll) */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1.5 scrollbar-none -mx-1 px-1">
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setActiveCategory(cat.name)}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-xs ${
              activeCategory === cat.name
                ? "bg-primary text-white shadow-primary/20 shadow-md scale-102"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800"
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeCategory === cat.name ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
            }`}>
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* No products found */}
      {filteredProducts.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <p className="text-base font-bold text-slate-900 dark:text-white">No accounts found matching "{searchQuery}"</p>
          <p className="text-xs text-slate-500">Try searching for a different platform, country, or category.</p>
          <Button onClick={() => { setSearchQuery(""); setActiveCategory("All"); }} variant="outline" className="text-xs font-bold">
            Reset Filters
          </Button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1. GRID VIEW: High-Density 2-Column on Mobile, 4-Col Desktop */}
      {/* ------------------------------------------------------------- */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {filteredProducts.map((product) => (
            <div 
              key={product.id} 
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col group"
            >
              {/* Compact Flag Header */}
              <div className="relative h-24 sm:h-36 w-full bg-slate-950 overflow-hidden">
                <img 
                  src={product.flag} 
                  alt={product.country} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/30 pointer-events-none" />

                {/* Country / Route Badge (Top Left) */}
                <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm text-white px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold flex items-center gap-1 shadow-xs border border-white/10">
                  <Globe className="h-3 w-3" />
                  <span className="truncate max-w-[65px] sm:max-w-none">{product.country}</span>
                </div>

                {/* Stock Badge (Top Right) */}
                <div className="absolute top-2 right-2 bg-emerald-500 text-white px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold shadow-xs">
                  <span>{product.stock} left</span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-3 sm:p-4 flex flex-col flex-1">
                <span className="text-[10px] sm:text-xs font-black text-amber-500 dark:text-amber-400 uppercase tracking-wider">
                  {product.platform}
                </span>

                <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm leading-snug line-clamp-2 mt-1 mb-3 group-hover:text-primary dark:group-hover:text-indigo-400 transition-colors">
                  {product.title}
                </h3>

                {/* Price & Buy Action */}
                <div className="mt-auto pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1">
                  <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
                    {product.price}
                  </span>
                  <Button 
                    size="sm" 
                    onClick={() => handleOpenBuy(product)}
                    className="h-8 sm:h-9 px-3 sm:px-4 bg-slate-900 dark:bg-white hover:bg-primary dark:hover:bg-primary text-white dark:text-slate-950 dark:hover:text-white font-black text-[11px] sm:text-xs rounded-xl shadow-xs transition-transform active:scale-95 flex items-center gap-1 shrink-0"
                  >
                    <ShoppingBag className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    Buy
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. LIST VIEW: High-Density Row Cards (Best for fast scrolling) */}
      {/* ------------------------------------------------------------- */}
      {viewMode === "list" && (
        <div className="space-y-2 sm:space-y-3">
          {filteredProducts.map((product) => (
            <div 
              key={product.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3 sm:p-4 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex items-center justify-between gap-3 group"
            >
              {/* Flag Avatar & Details */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0 relative bg-slate-950">
                  <img src={product.flag} alt={product.country} className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[8px] font-bold text-center text-white py-0.5 truncate px-0.5">
                    {product.country}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-wider">
                      {product.platform}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded">
                      {product.stock} in stock
                    </span>
                  </div>
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug truncate mt-0.5 group-hover:text-primary dark:group-hover:text-indigo-400 transition-colors">
                    {product.title}
                  </h3>
                </div>
              </div>

              {/* Price & Buy Action */}
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
                  {product.price}
                </span>
                <Button 
                  size="sm" 
                  onClick={() => handleOpenBuy(product)}
                  className="h-9 px-3.5 sm:px-4 bg-slate-900 dark:bg-white hover:bg-primary dark:hover:bg-primary text-white dark:text-slate-950 dark:hover:text-white font-black text-xs rounded-xl shadow-xs transition-transform active:scale-95 flex items-center gap-1.5"
                >
                  <ShoppingBag className="h-3.5 w-3.5" />
                  <span className="hidden xs:inline">Buy</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. INTERACTIVE BUY CHECKOUT MODAL / MOBILE BOTTOM SHEET       */}
      {/* ------------------------------------------------------------- */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full sm:max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-2xl space-y-5 animate-in slide-in-from-bottom-6 duration-300 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="font-black text-slate-900 dark:text-white text-base">
                  {purchaseComplete ? "Order Fulfilled!" : "Confirm Purchase"}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedProduct(null)}
                className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {!purchaseComplete ? (
              <>
                {/* Product Summary */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-3">
                  <div className="w-12 h-9 rounded-lg overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                    <img src={selectedProduct.flag} alt={selectedProduct.country} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-wider">{selectedProduct.platform}</span>
                    <p className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">{selectedProduct.title}</p>
                    <p className="text-[11px] font-extrabold text-primary dark:text-indigo-400 mt-0.5">{selectedProduct.price} each</p>
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Quantity</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setBuyQuantity(Math.max(1, buyQuantity - 1))}
                      className="h-8 w-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold flex items-center justify-center text-slate-700 dark:text-slate-200 active:scale-95"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-sm font-black text-slate-900 dark:text-white font-mono w-6 text-center">
                      {buyQuantity}
                    </span>
                    <button
                      onClick={() => setBuyQuantity(Math.min(selectedProduct.stock, buyQuantity + 1))}
                      className="h-8 w-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold flex items-center justify-center text-slate-700 dark:text-slate-200 active:scale-95"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Wallet Balance & Total Calculation */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                    <span>Available Wallet Balance</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">
                      {walletBalance === null ? "..." : `₦${new Intl.NumberFormat("en-NG", { minimumFractionDigits: 2 }).format(walletBalance)}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                    <span>Rate (×{buyQuantity})</span>
                    <span>₦{(selectedProduct.priceNum * buyQuantity).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-sm">
                    <span className="font-extrabold text-slate-900 dark:text-white">Total Charge</span>
                    <span className="text-xl font-black text-primary dark:text-indigo-400 font-mono">
                      ₦{(selectedProduct.priceNum * buyQuantity).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Action Trigger */}
                <Button 
                  onClick={handleConfirmPurchase}
                  disabled={isProcessingBuy}
                  className="w-full h-13 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-sm shadow-lg shadow-primary/25 transition-transform active:scale-95 flex items-center justify-center gap-2"
                >
                  {isProcessingBuy ? (
                    <span>Processing Payment...</span>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      Confirm & Deduct ₦{(selectedProduct.priceNum * buyQuantity).toLocaleString()}
                    </>
                  )}
                </Button>
              </>
            ) : (
              /* Success / Delivered Credentials HUD */
              <div className="space-y-5 animate-in zoom-in-95 duration-200">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-center space-y-1">
                  <div className="h-10 w-10 rounded-full bg-emerald-500 text-white mx-auto flex items-center justify-center shadow-md shadow-emerald-500/20">
                    <Check className="h-5 w-5 stroke-[3]" />
                  </div>
                  <h4 className="font-black text-slate-900 dark:text-white text-base pt-1">Purchase Successful!</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Order ID #LOG-{Math.floor(Math.random()*90000)+10000} has been credited to your account.</p>
                </div>

                {/* Delivered Credentials Card */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Your Account Credentials</span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">Saved in Orders</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 break-all leading-relaxed">
                    {selectedProduct.details}
                  </div>
                  <Button 
                    onClick={() => handleCopyCredentials(selectedProduct.details)}
                    className="w-full h-10 rounded-xl bg-slate-900 dark:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    {copiedCreds ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    {copiedCreds ? "Copied to Clipboard!" : "Copy Credentials"}
                  </Button>
                </div>

                {/* Bottom navigation */}
                <div className="flex gap-2">
                  <Link href="/dashboard/orders" className="flex-1">
                    <Button variant="outline" className="w-full h-12 rounded-xl text-xs font-bold border-slate-200 dark:border-slate-700">
                      View in Orders
                    </Button>
                  </Link>
                  <Button 
                    onClick={() => setSelectedProduct(null)}
                    className="flex-1 h-12 rounded-xl bg-primary text-white font-bold text-xs"
                  >
                    Continue Shopping
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
