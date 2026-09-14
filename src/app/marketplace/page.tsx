"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, Filter, Globe, ShoppingBag } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function MarketplacePage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { name: "All", count: 1245 },
    { name: "Facebook", count: 302 },
    { name: "VPNs", count: 145 },
    { name: "Google / Gmail", count: 856 },
    { name: "Discord", count: 124 },
    { name: "AI Accounts", count: 80 },
  ];

  const products = [
    {
      id: 1,
      flag: "https://flagcdn.com/w640/au.png",
      stock: 82,
      platform: "FACEBOOK",
      title: "Facebook | 2FA is enabled. Age: 90+ days. Verified by email @hotmail.com/outlook.com",
      price: "₦3,680"
    },
    {
      id: 2,
      flag: "https://flagcdn.com/w640/kr.png",
      stock: 1009,
      platform: "FACEBOOK",
      title: "Facebook | 2FA is enabled. Age: 1-2 Years. Verified with email access & cookies included",
      price: "₦4,500"
    },
    {
      id: 3,
      flag: "https://flagcdn.com/w640/eu.png",
      stock: 1579,
      platform: "FACEBOOK",
      title: "Facebook | Europe IP. Age: 90+ days. Verified by email @hotmail.com/outlook.com",
      price: "₦3,680"
    },
    {
      id: 4,
      flag: "https://flagcdn.com/w640/us.png",
      stock: 440,
      platform: "VPNS",
      title: "NordVPN Premium Account | 1 Year Subscription. Auto-renew enabled. Works on 6 devices",
      price: "₦2,150"
    },
    {
      id: 5,
      flag: "https://flagcdn.com/w640/gb.png",
      stock: 688,
      platform: "AI ACCOUNTS",
      title: "ChatGPT Plus | 1 Month Private Account. Email Access + GPT-4o enabled. Dedicated IP",
      price: "₦15,000"
    },
    {
      id: 6,
      flag: "https://flagcdn.com/w640/ca.png",
      stock: 32,
      platform: "DISCORD",
      title: "Discord Token | Fully Verified. 1 Year Old. No Captcha. Nitro ready & instant delivery",
      price: "₦850"
    },
    {
      id: 7,
      flag: "https://flagcdn.com/w640/hk.png",
      stock: 1894,
      platform: "FACEBOOK",
      title: "Facebook | Hong Kong IP. Aged 6+ Months. 2FA Active. Ready for Ads Manager",
      price: "₦4,200"
    },
    {
      id: 8,
      flag: "https://flagcdn.com/w640/de.png",
      stock: 512,
      platform: "GOOGLE / GMAIL",
      title: "Gmail Aged Accounts (2022) | German IP Verified. Recovery Email Included. Clean History",
      price: "₦1,800"
    }
  ];

  const filteredProducts = products.filter(product => {
    const matchesCategory = activeCategory === "All" || product.platform.toLowerCase().includes(activeCategory.toLowerCase());
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.platform.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-24 md:pb-12 max-w-7xl mx-auto px-2 sm:px-6">
      {/* Page Header (SocialVault Style) */}
      <div className="pt-1 sm:pt-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Products</h1>
        <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
          Discover and browse our premium social media account marketplace. Verified digital assets delivered instantly.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..." 
            className="pl-11 h-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm shadow-xs focus-visible:ring-primary/20 focus-visible:border-primary"
          />
        </div>
        <Button 
          variant="outline" 
          className="h-12 px-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs flex items-center gap-2"
        >
          <Filter className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          Filter
        </Button>
      </div>

      {/* Category Tabs / Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setActiveCategory(cat.name)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap shadow-xs ${
              activeCategory === cat.name
                ? "bg-primary text-white shadow-primary/20 shadow-md"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800"
            }`}
          >
            <span>{cat.name}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
              activeCategory === cat.name ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
            }`}>
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* Product Grid: Pixel-Perfect SocialVault 4-Column Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filteredProducts.map((product) => (
          <div 
            key={product.id} 
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col group"
          >
            {/* Full-Bleed Flag Header Image */}
            <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
              <img 
                src={product.flag} 
                alt={product.platform} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/20 pointer-events-none" />

              {/* VN Badge (Top Left) */}
              <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1.5 shadow-sm border border-white/10">
                <Globe className="h-3.5 w-3.5" />
                <span>VN</span>
              </div>

              {/* Stock Badge (Top Right) */}
              <div className="absolute top-3 right-3 bg-emerald-500 text-white px-2.5 py-1 rounded-md text-[11px] font-bold shadow-sm flex items-center gap-1.5">
                <span>{product.stock} In stock</span>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-4 flex flex-col flex-1">
              <span className="text-xs font-bold text-amber-500 uppercase tracking-wide">
                {product.platform}
              </span>

              <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm leading-snug line-clamp-3 mt-1.5 mb-4 group-hover:text-primary dark:group-hover:text-indigo-400 transition-colors">
                {product.title}
              </h3>

              {/* Price & Buy Action */}
              <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {product.price}
                </span>
                <Button 
                  size="sm" 
                  className="h-9 px-4 bg-slate-900 dark:bg-white hover:bg-primary dark:hover:bg-primary text-white dark:text-slate-950 dark:hover:text-white font-bold text-xs rounded-xl shadow-xs transition-transform active:scale-95 flex items-center gap-1.5"
                >
                  <ShoppingBag className="h-3.5 w-3.5" />
                  Buy
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
