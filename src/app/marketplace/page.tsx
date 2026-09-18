"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { 
  Search, Globe, ShoppingBag, Check, Copy, ShieldCheck, 
  Zap, X, LayoutGrid, List, AlertCircle, 
  Plus, Minus, RefreshCw, ExternalLink, Wallet
} from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { TransactionPinModal } from "@/components/TransactionPinModal";

interface MarketplaceItem {
  id: string;
  flag: string;
  country: string;
  stock: number;
  platform: string;
  category: string;
  title: string;
  priceNum: number;
  price: string;
  description: string;
}

export default function MarketplacePage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [userSession, setUserSession] = useState<any>(null);

  // Products from live database
  const [products, setProducts] = useState<MarketplaceItem[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Buy Checkout Modal State
  const [selectedProduct, setSelectedProduct] = useState<MarketplaceItem | null>(null);
  const [isProcessingBuy, setIsProcessingBuy] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const [deliveredCredentials, setDeliveredCredentials] = useState<string>("");
  const [orderReference, setOrderReference] = useState<string>("");
  const [buyError, setBuyError] = useState<string | null>(null);
  const [copiedCreds, setCopiedCreds] = useState(false);
  const [pinModalOpen, setPinModalOpen] = useState(false);

  // Fetch real wallet balance and session
  const fetchBalance = useCallback(async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData?.session;
    setUserSession(session);
    if (!session) return;

    const { data: wallet } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", session.user.id)
      .single();

    setWalletBalance(Number(wallet?.balance ?? 0));
  }, []);

  // Fetch real available products from database
  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch("/api/marketplace/products");
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    fetchBalance();
    fetchProducts();
  }, [fetchBalance, fetchProducts]);

  // Categories list dynamically calculated from live products
  const categoryNames = ["All", "Google Voice", "Facebook", "Instagram", "Twitter / X", "Gmail", "VPNs", "Discord", "AI Accounts", "TikTok"];
  
  const categories = categoryNames.map((name) => {
    let count = 0;
    if (name === "All") {
      count = products.length;
    } else {
      count = products.filter((p) => 
        p.category.toLowerCase().includes(name.toLowerCase()) || 
        p.platform.toLowerCase().includes(name.toLowerCase())
      ).length;
    }

    const iconMap: Record<string, string> = {
      All: "🔥",
      "Google Voice": "📞",
      Facebook: "📘",
      Instagram: "📸",
      "Twitter / X": "🐦",
      Gmail: "🔴",
      VPNs: "🛡️",
      Discord: "💬",
      "AI Accounts": "🤖",
      TikTok: "🎵",
    };

    return {
      name,
      icon: iconMap[name] || "📦",
      count,
    };
  });

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      activeCategory === "All" ||
      product.category.toLowerCase().includes(activeCategory.toLowerCase()) ||
      product.platform.toLowerCase().includes(activeCategory.toLowerCase());

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      product.title.toLowerCase().includes(q) ||
      product.platform.toLowerCase().includes(q) ||
      product.country.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  const handleOpenBuy = (product: MarketplaceItem) => {
    if (!userSession) {
      router.push("/login?redirect=/marketplace");
      return;
    }
    setSelectedProduct(product);
    setPurchaseComplete(false);
    setDeliveredCredentials("");
    setOrderReference("");
    setBuyError(null);
    setCopiedCreds(false);
  };

  const handleOpenPinModal = () => {
    if (!selectedProduct) return;

    const currentBal = walletBalance ?? 0;
    if (currentBal < selectedProduct.priceNum) {
      setBuyError(`Insufficient balance. You need ₦${(selectedProduct.priceNum - currentBal).toLocaleString()} more.`);
      return;
    }
    setBuyError(null);
    setPinModalOpen(true);
  };

  const executePurchase = async () => {
    if (!selectedProduct) return;

    setIsProcessingBuy(true);
    setBuyError(null);

    try {
      const token = userSession?.access_token;
      const res = await fetch("/api/marketplace/buy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          logId: selectedProduct.id,
          userId: userSession?.user?.id,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to purchase account. Please try again.");
      }

      // Success: update balance, set credentials, update UI
      setDeliveredCredentials(data.formattedCredentials || JSON.stringify(data.credentials, null, 2));
      setOrderReference(data.reference || data.orderId || "COMPLETED");
      if (typeof data.newBalance === "number") {
        setWalletBalance(data.newBalance);
      } else {
        await fetchBalance();
      }
      setPurchaseComplete(true);

      // Refresh products so sold log is removed from catalog
      fetchProducts();
    } catch (err: any) {
      console.error("Purchase error:", err);
      setBuyError(err.message || "An unexpected error occurred during purchase.");
    } finally {
      setIsProcessingBuy(false);
    }
  };

  const handleCopyCredentials = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCreds(true);
    setTimeout(() => setCopiedCreds(false), 2000);
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-28 md:pb-12 max-w-7xl mx-auto px-1 sm:px-4">
      {/* Header */}
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
          <Link href="/dashboard/wallet/fund">
            <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 shrink-0 hover:bg-emerald-100 transition-colors">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                Wallet: {walletBalance === null ? "..." : `₦${new Intl.NumberFormat("en-NG", { minimumFractionDigits: 2 }).format(walletBalance)}`}
              </span>
              <Plus className="h-3 w-3 ml-1 text-emerald-600" />
            </div>
          </Link>
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

        {/* View Mode Switcher */}
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

      {/* Category Pills */}
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

      {/* Loading state */}
      {loadingProducts && (
        <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="h-6 w-6 animate-spin text-primary" />
          <p className="text-xs font-bold text-slate-500">Connecting to real database inventory...</p>
        </div>
      )}

      {/* No products found */}
      {!loadingProducts && filteredProducts.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <p className="text-base font-bold text-slate-900 dark:text-white">
            {products.length === 0 ? "No Accounts Currently in Stock" : `No accounts found matching "${searchQuery}"`}
          </p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {products.length === 0 
              ? "New aged accounts, Google Voice numbers, and VPN tokens are uploaded by admins daily. Check back shortly!"
              : "Try searching for a different platform, country, or category."}
          </p>
          {products.length > 0 && (
            <Button onClick={() => { setSearchQuery(""); setActiveCategory("All"); }} variant="outline" className="text-xs font-bold">
              Reset Filters
            </Button>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1. GRID VIEW                                                  */}
      {/* ------------------------------------------------------------- */}
      {!loadingProducts && viewMode === "grid" && filteredProducts.length > 0 && (
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

                {/* Country Badge */}
                <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm text-white px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold flex items-center gap-1 shadow-xs border border-white/10">
                  <Globe className="h-3 w-3" />
                  <span className="truncate max-w-[65px] sm:max-w-none">{product.country}</span>
                </div>

                {/* Stock Badge */}
                <div className="absolute top-2 right-2 bg-emerald-500 text-white px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold shadow-xs">
                  <span>Available</span>
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
      {/* 2. LIST VIEW                                                  */}
      {/* ------------------------------------------------------------- */}
      {!loadingProducts && viewMode === "list" && filteredProducts.length > 0 && (
        <div className="space-y-2 sm:space-y-3">
          {filteredProducts.map((product) => (
            <div 
              key={product.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3 sm:p-4 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex items-center justify-between gap-3 group"
            >
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
                      In Stock
                    </span>
                  </div>
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug truncate mt-0.5 group-hover:text-primary dark:group-hover:text-indigo-400 transition-colors">
                    {product.title}
                  </h3>
                </div>
              </div>

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
      {/* 3. REAL SECURE CHECKOUT MODAL                                 */}
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
                  {purchaseComplete ? "Log Delivered Successfully!" : "Confirm Purchase"}
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
                    <p className="text-[11px] font-extrabold text-primary dark:text-indigo-400 mt-0.5">{selectedProduct.price}</p>
                  </div>
                </div>

                {/* Wallet Balance & Cost Breakdown */}
                <div className="space-y-2 pt-1 p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Wallet className="h-3.5 w-3.5" /> Your Wallet Balance
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">
                      {walletBalance === null ? "..." : `₦${new Intl.NumberFormat("en-NG", { minimumFractionDigits: 2 }).format(walletBalance)}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                    <span>Item Price</span>
                    <span className="font-bold font-mono">₦{selectedProduct.priceNum.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700 text-sm">
                    <span className="font-extrabold text-slate-900 dark:text-white">Amount to Deduct</span>
                    <span className="text-xl font-black text-primary dark:text-indigo-400 font-mono">
                      ₦{selectedProduct.priceNum.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Insufficient Funds Warning */}
                {(walletBalance ?? 0) < selectedProduct.priceNum && (
                  <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>Insufficient Wallet Balance</span>
                    </div>
                    <p className="text-red-600 dark:text-red-300">
                      You need <strong>₦{(selectedProduct.priceNum - (walletBalance ?? 0)).toLocaleString()}</strong> more to complete this purchase.
                    </p>
                    <Link href="/dashboard/wallet/fund" className="block pt-1">
                      <Button className="w-full h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs">
                        Fund Wallet Now
                      </Button>
                    </Link>
                  </div>
                )}

                {buyError && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs font-semibold">
                    {buyError}
                  </div>
                )}

                {/* Purchase Action Button */}
                {(walletBalance ?? 0) >= selectedProduct.priceNum ? (
                  <Button 
                    onClick={handleOpenPinModal}
                    disabled={isProcessingBuy}
                    className="w-full h-13 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-sm shadow-lg shadow-primary/25 transition-transform active:scale-95 flex items-center justify-center gap-2"
                  >
                    {isProcessingBuy ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" /> Verifying & Deducting Balance...
                      </span>
                    ) : (
                      <>
                        <Zap className="h-4 w-4" />
                        Confirm & Pay ₦{selectedProduct.priceNum.toLocaleString()}
                      </>
                    )}
                  </Button>
                ) : (
                  <Button 
                    disabled
                    className="w-full h-13 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-black text-sm cursor-not-allowed"
                  >
                    Cannot Purchase — Fund Wallet First
                  </Button>
                )}
              </>
            ) : (
              /* Success / REAL Delivered Credentials HUD */
              <div className="space-y-5 animate-in zoom-in-95 duration-200">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-center space-y-1">
                  <div className="h-10 w-10 rounded-full bg-emerald-500 text-white mx-auto flex items-center justify-center shadow-md shadow-emerald-500/20">
                    <Check className="h-5 w-5 stroke-[3]" />
                  </div>
                  <h4 className="font-black text-slate-900 dark:text-white text-base pt-1">Purchase Successful!</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    Ref #{orderReference} · ₦{selectedProduct.priceNum.toLocaleString()} deducted
                  </p>
                </div>

                {/* Real Delivered Credentials Card */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Your Account Credentials
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                      Saved in Orders
                    </span>
                  </div>
                  <pre className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 break-all leading-relaxed whitespace-pre-wrap">
                    {deliveredCredentials}
                  </pre>
                  <Button 
                    onClick={() => handleCopyCredentials(deliveredCredentials)}
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
                    Done
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4-Digit Security PIN Modal */}
      <TransactionPinModal
        isOpen={pinModalOpen}
        onClose={() => setPinModalOpen(false)}
        onSuccess={executePurchase}
        amountNGN={selectedProduct?.priceNum || 0}
        description={`Buy Log: ${selectedProduct?.title || "Account"}`}
        userId={userSession?.user?.id}
        authToken={userSession?.access_token}
      />
    </div>
  );
}
