"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, CheckCircle2, ChevronDown, Smartphone, Globe, ShieldCheck, Zap, 
  Copy, Clock, MessageSquare, Check, Wifi, Tv, Contact, Sparkles, AlertCircle,
  Radio, CheckCircle, Shield, ArrowRight, Flame, HelpCircle, Layers, Star,
  TrendingUp, RefreshCw, Info, ExternalLink, ShieldAlert, BadgeCheck
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

export default function ServicePage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const pathname = usePathname();
  const rawSlug = pathname.split('/').pop() || "";
  const slug = rawSlug.toLowerCase();

  // --- Common VTU State ---
  const [selectedNetwork, setSelectedNetwork] = useState("mtn");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dataPlan, setDataPlan] = useState("1gb");
  const [dataCategory, setDataCategory] = useState("sme");
  const [airtimeAmount, setAirtimeAmount] = useState("1000");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // --- Cable TV State ---
  const [cableProvider, setCableProvider] = useState("gotv");
  const [iucNumber, setIucNumber] = useState("");
  const [isVerifyingIuc, setIsVerifyingIuc] = useState(false);
  const [verifiedName, setVerifiedName] = useState<string | null>(null);
  const [cablePackage, setCablePackage] = useState("gotv-max");

  // --- Virtual Number (OTPClouds) Rich State ---
  const [selectedOtpService, setSelectedOtpService] = useState("whatsapp");
  const [selectedOtpCountry, setSelectedOtpCountry] = useState("us");
  const [hasGeneratedNumber, setHasGeneratedNumber] = useState(false);
  const [smsTimer, setSmsTimer] = useState(1185); // 19m 45s
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [smsReceived, setSmsReceived] = useState(false);

  // --- SMM Boost (Paxplug) Rich State ---
  const [selectedSmmPlatform, setSelectedSmmPlatform] = useState("instagram");
  const [smmCategory, setSmmCategory] = useState("followers");
  const [selectedSmmServiceId, setSelectedSmmServiceId] = useState("ig-fol-1");
  const [smmLink, setSmmLink] = useState("");
  const [smmQuantity, setSmmQuantity] = useState("1000");
  const [smmSuccess, setSmmSuccess] = useState(false);

  // --- Affiliate Site State ---
  const [selectedDomain, setSelectedDomain] = useState(".com");
  const [domainName, setDomainName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [affiliateSubmitted, setAffiliateSubmitted] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (hasGeneratedNumber && smsTimer > 0) {
      interval = setInterval(() => setSmsTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [hasGeneratedNumber, smsTimer]);

  // Simulate incoming SMS after 4 seconds of generating number
  useEffect(() => {
    if (hasGeneratedNumber && !smsReceived) {
      const timer = setTimeout(() => {
        setSmsReceived(true);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [hasGeneratedNumber, smsReceived]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs < 10 ? "0" : ""}${remainingSecs}`;
  };

  const handleCopy = (text: string, type: "num" | "code") => {
    navigator.clipboard.writeText(text);
    if (type === "num") {
      setCopiedNumber(true);
      setTimeout(() => setCopiedNumber(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // -------------------------------------------------------------
  // SMM PLATFORMS & SERVICES DATA (Paxplug Reference)
  // -------------------------------------------------------------
  const smmPlatforms = [
    { id: "instagram", name: "Instagram", icon: "📸", color: "from-fuchsia-500 to-rose-500", border: "border-fuchsia-500" },
    { id: "tiktok", name: "TikTok", icon: "🎵", color: "from-slate-900 to-slate-800", border: "border-slate-900" },
    { id: "telegram", name: "Telegram", icon: "✈️", color: "from-sky-400 to-blue-600", border: "border-sky-500" },
    { id: "twitter", name: "Twitter / X", icon: "🐦", color: "from-slate-950 to-slate-800", border: "border-slate-900" },
    { id: "youtube", name: "YouTube", icon: "▶️", color: "from-red-600 to-rose-700", border: "border-red-600" },
    { id: "facebook", name: "Facebook", icon: "📘", color: "from-blue-600 to-indigo-700", border: "border-blue-600" },
  ];

  const smmServices = [
    {
      id: "ig-fol-1",
      platform: "instagram",
      category: "followers",
      quality: "HIGH",
      qualityColor: "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/60",
      name: "Instagram Followers [Guaranteed 30 Days Refill | Super Instant]",
      speed: "50k/Day",
      minMax: "100 - 500,000",
      rate: 1450,
      badge: "Best Seller"
    },
    {
      id: "ig-fol-2",
      platform: "instagram",
      category: "followers",
      quality: "FARM",
      qualityColor: "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900/60",
      name: "Instagram Real Nigerian Followers [Organic Active Accounts]",
      speed: "5k/Day",
      minMax: "50 - 20,000",
      rate: 3200,
      badge: "100% Organic"
    },
    {
      id: "ig-lik-1",
      platform: "instagram",
      category: "likes",
      quality: "HIGH",
      qualityColor: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60",
      name: "Instagram HQ Likes [Non-Drop + Real Looking Impressions]",
      speed: "100k/Day",
      minMax: "50 - 100,000",
      rate: 450,
      badge: "Instant 0-5m"
    },
    {
      id: "tt-fol-1",
      platform: "tiktok",
      category: "followers",
      quality: "HIGH",
      qualityColor: "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/60",
      name: "TikTok Followers [Global Active | 30 Days Auto-Refill]",
      speed: "30k/Day",
      minMax: "100 - 100,000",
      rate: 1850,
      badge: "Popular"
    },
    {
      id: "tt-viw-1",
      platform: "tiktok",
      category: "views",
      quality: "LOW",
      qualityColor: "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/60",
      name: "TikTok Viral Video Views [Algorithmic For-You-Page Boost]",
      speed: "500k/Day",
      minMax: "1,000 - 10,000,000",
      rate: 90,
      badge: "Ultra Fast"
    },
    {
      id: "tg-mem-1",
      platform: "telegram",
      category: "members",
      quality: "HIGH",
      qualityColor: "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/60",
      name: "Telegram Channel / Group Members [Zero Drop | Lifetime Guarantee]",
      speed: "20k/Day",
      minMax: "100 - 50,000",
      rate: 1200,
      badge: "Lifetime Refill"
    }
  ];

  // -------------------------------------------------------------
  // VIRTUAL NUMBER SERVICES & COUNTRIES DATA (OTPClouds Reference)
  // -------------------------------------------------------------
  const otpServices = [
    { id: "whatsapp", name: "WhatsApp", icon: "🟢", startingPrice: "₦850", popular: true },
    { id: "telegram", name: "Telegram", icon: "✈️", startingPrice: "₦750", popular: true },
    { id: "openai", name: "OpenAI / ChatGPT", icon: "🤖", startingPrice: "₦950", popular: true },
    { id: "tinder", name: "Tinder", icon: "🔥", startingPrice: "₦1,200", popular: false },
    { id: "google", name: "Google / Gmail", icon: "🔴", startingPrice: "₦900", popular: true },
    { id: "tiktok", name: "TikTok", icon: "🎵", startingPrice: "₦800", popular: false },
    { id: "facebook", name: "Facebook", icon: "📘", startingPrice: "₦850", popular: false },
    { id: "twitter", name: "Twitter / X", icon: "🐦", startingPrice: "₦850", popular: false },
  ];

  const otpCountries = [
    { id: "us", name: "United States", code: "+1", flag: "https://flagcdn.com/w160/us.png", price: 1200, stock: "940 left" },
    { id: "ng", name: "Nigeria", code: "+234", flag: "https://flagcdn.com/w160/ng.png", price: 850, stock: "1,420 left" },
    { id: "gb", name: "United Kingdom", code: "+44", flag: "https://flagcdn.com/w160/gb.png", price: 1500, stock: "310 left" },
    { id: "gh", name: "Ghana", code: "+233", flag: "https://flagcdn.com/w160/gh.png", price: 950, stock: "180 left" },
    { id: "za", name: "South Africa", code: "+27", flag: "https://flagcdn.com/w160/za.png", price: 1100, stock: "450 left" },
    { id: "ke", name: "Kenya", code: "+254", flag: "https://flagcdn.com/w160/ke.png", price: 900, stock: "220 left" },
  ];

  // -------------------------------------------------------------
  // 1. RICH VIRTUAL NUMBER (SMS OTP) FLOW (OTPClouds / Primex)
  // -------------------------------------------------------------
  if (slug.includes("virtual") || slug.includes("rent-number")) {
    const activeCountryObj = otpCountries.find(c => c.id === selectedOtpCountry) || otpCountries[0];
    const activeServiceObj = otpServices.find(s => s.id === selectedOtpService) || otpServices[0];

    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-24 md:pb-12 pt-2 md:pt-4 px-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.back()}
              className="h-10 w-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-slate-700 dark:text-slate-200" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Virtual Numbers (SMS OTP)</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Rent non-VoIP private numbers for instant 2FA SMS verification codes</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-full text-xs font-bold text-emerald-700 dark:text-emerald-300">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Servers Online (99.9% Success)</span>
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-5 sm:p-6 shadow-md border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available Wallet Balance</span>
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">₦248,500.00</div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Refund Guarantee</span>
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
              <ShieldCheck className="h-3.5 w-3.5" /> 100% Auto-Refund if No SMS
            </div>
          </div>
        </div>

        {/* Step 1: Rich Service Grid Selection */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">1</span>
              Select Target Service
            </label>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">8 Supported Apps</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {otpServices.map((srv) => (
              <div
                key={srv.id}
                onClick={() => setSelectedOtpService(srv.id)}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 relative ${
                  selectedOtpService === srv.id
                    ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-xs ring-2 ring-primary/20"
                    : "border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
              >
                <span className="text-2xl">{srv.icon}</span>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate">{srv.name}</span>
                  <span className="text-[10px] font-extrabold text-primary dark:text-indigo-400 mt-0.5">{srv.startingPrice}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 2: Country Selection Grid with Flag CDN */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">2</span>
              Select Country & Carrier Route
            </label>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">All Non-VoIP</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {otpCountries.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedOtpCountry(c.id)}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                  selectedOtpCountry === c.id
                    ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-xs ring-2 ring-primary/20"
                    : "border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-6 rounded border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs shrink-0">
                    <img src={c.flag} alt={c.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{c.name}</p>
                    <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">{c.code} · {c.stock}</p>
                  </div>
                </div>
                <span className="text-sm font-black text-slate-900 dark:text-white">₦{c.price.toLocaleString()}</span>
              </div>
            ))}
          </div>

          {/* Action trigger */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Order: <strong className="text-slate-900 dark:text-white">{activeCountryObj.name} ({activeCountryObj.code})</strong> for <strong className="text-slate-900 dark:text-white">{activeServiceObj.name}</strong> · Rate: <strong className="text-primary dark:text-indigo-400">₦{activeCountryObj.price.toLocaleString()}</strong>
            </div>
            <Button
              onClick={() => {
                setHasGeneratedNumber(true);
                setSmsReceived(false);
                setSmsTimer(1185);
              }}
              className="w-full sm:w-auto h-13 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black shadow-lg shadow-primary/25 transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Generate Number (₦{activeCountryObj.price.toLocaleString()})
            </Button>
          </div>
        </div>

        {/* Live Active Number & SMS Receiver HUD (Interactive OTP Receiver) */}
        {hasGeneratedNumber && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-primary p-6 sm:p-8 shadow-xl shadow-primary/10 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Top Status Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <span className="flex h-3.5 w-3.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                </span>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-sm tracking-wide uppercase">
                    Active Session: {activeServiceObj.name} ({activeCountryObj.name})
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500">Direct carrier routing assigned</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800 px-3 py-1.5 rounded-xl">
                <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span>{formatTime(smsTimer)}</span>
              </div>
            </div>

            {/* Generated Phone Number Display */}
            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Your Dedicated Verification Number
                </span>
                <div className="text-3xl font-black text-slate-900 dark:text-white tracking-wider font-mono">
                  +1 (202) 854-3918
                </div>
              </div>
              <Button 
                onClick={() => handleCopy("+12028543918", "num")}
                className="h-11 px-6 rounded-xl bg-slate-900 dark:bg-slate-700 text-white hover:bg-primary font-bold text-xs flex items-center gap-2 shadow-sm"
              >
                {copiedNumber ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                {copiedNumber ? "Copied to Clipboard!" : "Copy Number"}
              </Button>
            </div>

            {/* Live SMS Receiver Status Box */}
            {!smsReceived ? (
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col items-center justify-center text-center space-y-3">
                <div className="h-14 w-14 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-indigo-400 animate-pulse">
                  <RefreshCw className="h-7 w-7 animate-spin duration-1000" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-base">Listening for incoming SMS...</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md leading-relaxed">
                    Paste this number into <strong>{activeServiceObj.name}</strong> and click "Send SMS". Your code will be automatically intercepted here within 5-15 seconds.
                  </p>
                </div>
              </div>
            ) : (
              <div className="border-2 border-emerald-500/40 rounded-2xl p-6 bg-emerald-50/40 dark:bg-emerald-950/30 space-y-4 animate-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-black uppercase text-emerald-900 dark:text-emerald-300 tracking-wider">SMS Received Successfully!</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-0.5 rounded-full">Just now</span>
                </div>

                <div className="bg-white dark:bg-slate-800/90 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                  <div className="space-y-0.5 text-center sm:text-left">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Your {activeServiceObj.name} verification code is:</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white font-mono tracking-widest">849 - 204</p>
                  </div>
                  <Button 
                    onClick={() => handleCopy("849204", "code")}
                    className="h-12 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md shadow-emerald-600/20 flex items-center gap-2"
                  >
                    {copiedCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copiedCode ? "Copied!" : "Copy Code"}
                  </Button>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                Did not receive SMS? Cancel within 20 mins for a full refund.
              </span>
              <Button 
                onClick={() => {
                  setHasGeneratedNumber(false);
                  setSmsReceived(false);
                }}
                variant="ghost" 
                className="text-xs font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl"
              >
                Cancel & Refund Wallet
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. RICH SMM BOOST SERVICES FLOW (Paxplug Reference)
  // -------------------------------------------------------------
  if (slug.includes("boost")) {
    const activeService = smmServices.find(s => s.id === selectedSmmServiceId) || smmServices[0];
    const totalPrice = ((parseInt(smmQuantity) || 0) / 1000) * activeService.rate;

    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-24 md:pb-12 pt-2 md:pt-4 px-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.back()}
              className="h-10 w-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-slate-700 dark:text-slate-200" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Boost Services (SMM Panel)</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Grow your social media presence with instant guaranteed engagements</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 bg-primary/10 text-primary dark:text-indigo-400 border border-primary/20 px-3 py-1 rounded-full text-xs font-bold">
            <Zap className="h-3.5 w-3.5" />
            <span>High Speed V2 API</span>
          </div>
        </div>

        {/* Paxplug Quality Guide Banner */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
            <ShieldCheck className="h-4 w-4 text-primary dark:text-indigo-400" />
            <span>Service Quality Guide:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 font-bold text-[11px]">
            <span className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-md">🟡 LOW</span>
            <span className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-md">🟢 MEDIUM</span>
            <span className="flex items-center gap-1 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-md">🔵 HIGH</span>
            <span className="flex items-center gap-1 bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 px-2 py-0.5 rounded-md">🟣 FARM</span>
            <span className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 px-2 py-0.5 rounded-md">🟠 PROVIDER</span>
          </div>
        </div>

        {/* Step 1: Platform Selection Cards */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-7 shadow-sm space-y-4">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <span className="h-5 w-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">1</span>
            Select Platform
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
            {smmPlatforms.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedSmmPlatform(p.id);
                  const firstMatch = smmServices.find(s => s.platform === p.id);
                  if (firstMatch) setSelectedSmmServiceId(firstMatch.id);
                }}
                className={`p-3 rounded-2xl border-2 font-black text-xs transition-all flex flex-col items-center gap-2 ${
                  selectedSmmPlatform === p.id
                    ? "border-primary bg-primary/5 dark:bg-primary/10 text-slate-900 dark:text-white shadow-xs ring-2 ring-primary/20"
                    : "border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800"
                }`}
              >
                <span className="text-2xl">{p.icon}</span>
                <span className="text-xs font-bold">{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Specific Service Package List */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-7 shadow-sm space-y-4">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <span className="h-5 w-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">2</span>
            Select Specific Service Package
          </label>

          <div className="space-y-2.5">
            {smmServices
              .filter(s => s.platform === selectedSmmPlatform)
              .map((srv) => (
                <div
                  key={srv.id}
                  onClick={() => setSelectedSmmServiceId(srv.id)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    selectedSmmServiceId === srv.id
                      ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-xs ring-2 ring-primary/20"
                      : "border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${srv.qualityColor}`}>
                        {srv.quality}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/60">
                        {srv.badge}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                        Speed: {srv.speed} · Min: {srv.minMax}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                      {srv.name}
                    </h3>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-base font-black text-slate-900 dark:text-white">₦{srv.rate.toLocaleString()}</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-bold block">per 1,000</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Step 3: Order Details */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-7 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Target Link */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <span className="h-5 w-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">3</span>
                Target Profile Link or Post URL
              </label>
              <Input 
                value={smmLink}
                onChange={(e) => setSmmLink(e.target.value)}
                placeholder="https://instagram.com/your_handle"
                className="h-13 rounded-2xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-semibold text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Make sure the account is set to public, not private.</p>
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <span className="h-5 w-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">4</span>
                Quantity (Min: 100)
              </label>
              <Input 
                type="number"
                value={smmQuantity}
                onChange={(e) => setSmmQuantity(e.target.value)}
                placeholder="1000" 
                className="h-13 rounded-2xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-black text-base text-slate-900 dark:text-white"
              />
              <div className="flex gap-2 pt-1">
                {["500", "1000", "2500", "5000", "10000"].map((q) => (
                  <button
                    key={q}
                    onClick={() => setSmmQuantity(q)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                      smmQuantity === q
                        ? "bg-primary text-white border-primary"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Checkout Breakdown */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Wallet Balance</span>
              <p className="text-sm font-black text-slate-900 dark:text-white">₦248,500.00</p>
            </div>
            <div className="text-right space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Charge</span>
              <p className="text-xl font-black text-primary dark:text-indigo-400">₦{Math.round(totalPrice).toLocaleString()}</p>
            </div>
          </div>

          {smmSuccess ? (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-center font-bold text-sm flex items-center justify-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <span>Order Placed! Order ID #SMM-{Math.floor(Math.random()*90000)+10000} is processing.</span>
            </div>
          ) : (
            <Button 
              onClick={() => setSmmSuccess(true)}
              className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-base shadow-lg shadow-primary/25 transition-transform active:scale-95"
            >
              Submit Boost Order (₦{Math.round(totalPrice).toLocaleString()})
            </Button>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 3. BUY DATA FLOW
  // -------------------------------------------------------------
  if (slug.includes("data")) {
    const networks = [
      { id: "mtn", name: "MTN", color: "bg-amber-400 text-slate-900 border-amber-400", discount: "2% Off", dot: "bg-amber-500" },
      { id: "airtel", name: "Airtel", color: "bg-rose-600 text-white border-rose-600", discount: "2% Off", dot: "bg-rose-500" },
      { id: "glo", name: "Glo", color: "bg-emerald-600 text-white border-emerald-600", discount: "3% Off", dot: "bg-emerald-500" },
      { id: "9mobile", name: "9mobile", color: "bg-teal-800 text-white border-teal-800", discount: "2.5% Off", dot: "bg-teal-700" },
    ];

    const dataPlans = [
      { id: "500mb", size: "500 MB", validity: "30 Days", price: "₦145", best: false },
      { id: "1gb", size: "1.0 GB", validity: "30 Days", price: "₦280", best: true },
      { id: "2gb", size: "2.0 GB", validity: "30 Days", price: "₦560", best: false },
      { id: "3gb", size: "3.0 GB", validity: "30 Days", price: "₦840", best: false },
      { id: "5gb", size: "5.0 GB", validity: "30 Days", price: "₦1,390", best: true },
      { id: "10gb", size: "10.0 GB", validity: "30 Days", price: "₦2,780", best: false },
      { id: "20gb", size: "20.0 GB", validity: "30 Days", price: "₦5,500", best: false },
      { id: "40gb", size: "40.0 GB", validity: "30 Days", price: "₦11,000", best: false },
    ];

    return (
      <div className="max-w-2xl mx-auto space-y-6 pb-24 md:pb-12 pt-2 md:pt-4 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.back()}
              className="h-10 w-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-slate-700 dark:text-slate-200" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Buy Data</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Instant 24/7 automated data bundle delivery</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full text-xs font-bold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>2% Cashback Active</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-7 shadow-sm space-y-6">
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Select Network Provider</label>
            <div className="grid grid-cols-4 gap-2.5">
              {networks.map((net) => (
                <button
                  key={net.id}
                  onClick={() => setSelectedNetwork(net.id)}
                  className={`py-3 px-2 rounded-2xl border-2 font-black text-xs transition-all flex flex-col items-center gap-1 ${
                    selectedNetwork === net.id 
                      ? `${net.color} shadow-md scale-102` 
                      : "bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                  }`}
                >
                  <div className={`h-2.5 w-2.5 rounded-full ${selectedNetwork === net.id ? "bg-white" : net.dot}`} />
                  <span>{net.name}</span>
                  <span className={`text-[9px] font-semibold opacity-80 ${selectedNetwork === net.id ? "text-white" : "text-slate-400 dark:text-slate-500"}`}>
                    {net.discount}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Recipient Phone Number</label>
            <Input 
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="e.g. 0812 345 6789" 
              className="h-13 rounded-2xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-bold text-base text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Select Data Plan</label>
              <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                {["SME", "Gifting", "Corporate"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setDataCategory(cat.toLowerCase())}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${
                      dataCategory === cat.toLowerCase() 
                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs" 
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {dataPlans.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => setDataPlan(plan.id)}
                  className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center text-center relative ${
                    dataPlan === plan.id
                      ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-xs"
                      : "border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  {plan.best && (
                    <span className="absolute -top-2 bg-emerald-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full">
                      Best
                    </span>
                  )}
                  <span className="text-base font-black text-slate-900 dark:text-white mt-1">{plan.size}</span>
                  <span className="text-xs font-extrabold text-primary dark:text-indigo-400">{plan.price}</span>
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500">{plan.validity}</span>
                </div>
              ))}
            </div>
          </div>

          <Button 
            onClick={() => setIsSuccess(true)}
            className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-base shadow-lg shadow-primary/25"
          >
            {isSuccess ? "Delivery Complete!" : `Pay ${dataPlans.find(p => p.id === dataPlan)?.price || "₦280"}`}
          </Button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 4. BUY AIRTIME FLOW
  // -------------------------------------------------------------
  if (slug.includes("airtime")) {
    const networks = [
      { id: "mtn", name: "MTN", color: "bg-amber-400 text-slate-900 border-amber-400", discount: "2% Off" },
      { id: "airtel", name: "Airtel", color: "bg-rose-600 text-white border-rose-600", discount: "2% Off" },
      { id: "glo", name: "Glo", color: "bg-emerald-600 text-white border-emerald-600", discount: "3% Off" },
      { id: "9mobile", name: "9mobile", color: "bg-teal-800 text-white border-teal-800", discount: "2.5% Off" },
    ];

    return (
      <div className="max-w-2xl mx-auto space-y-6 pb-24 md:pb-12 pt-2 md:pt-4 px-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.back()}
            className="h-10 w-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-700 dark:text-slate-200" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Buy Airtime</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Instant top-up with up to 3% discount</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-7 shadow-sm space-y-6">
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Select Network</label>
            <div className="grid grid-cols-4 gap-2.5">
              {networks.map((net) => (
                <button
                  key={net.id}
                  onClick={() => setSelectedNetwork(net.id)}
                  className={`py-3 px-2 rounded-2xl border-2 font-black text-xs transition-all flex flex-col items-center gap-1 ${
                    selectedNetwork === net.id 
                      ? `${net.color} shadow-md scale-102` 
                      : "bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                  }`}
                >
                  <span>{net.name}</span>
                  <span className="text-[9px] font-semibold opacity-80">{net.discount}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Phone Number</label>
            <Input 
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="08012345678" 
              className="h-13 rounded-2xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-bold text-base text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Amount (₦)</label>
            <Input 
              value={airtimeAmount}
              onChange={(e) => setAirtimeAmount(e.target.value)}
              type="number"
              placeholder="1000" 
              className="h-13 rounded-2xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-black text-lg text-slate-900 dark:text-white"
            />
            <div className="flex flex-wrap gap-2 pt-1">
              {["100", "200", "500", "1000", "2000", "5000"].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setAirtimeAmount(amt)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    airtimeAmount === amt 
                      ? "bg-primary text-white border-primary" 
                      : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  ₦{amt}
                </button>
              ))}
            </div>
          </div>

          <Button 
            onClick={() => setIsSuccess(true)}
            className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-base shadow-lg shadow-primary/25"
          >
            {isSuccess ? "Recharge Complete!" : `Recharge ₦${airtimeAmount || "0"}`}
          </Button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 5. AFFILIATE WEBSITE LEAD GEN FLOW (Primex Reference)
  // -------------------------------------------------------------
  if (slug.includes("affiliate")) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-24 md:pb-12 pt-2 md:pt-4 px-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.back()}
            className="h-10 w-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-700 dark:text-slate-200" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Affiliate Website</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Own your own automated digital platform connected to our APIs</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl border border-slate-800">
          <div className="relative z-10 max-w-xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-blue-200 border border-white/10">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-300" />
              <span>Affiliate Website Program</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Own Your Own Platform. Sell Every Product.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Get a fully set up website just like TSLA — virtual numbers, SMM boosting, social logs, wallet system, and full admin control. Your brand, your profit.
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              {["Virtual Numbers", "SMM Boost", "Social Logs", "Wallet System", "Full Admin Panel", "Profit Dashboard", "PocketFi Integration", "Referral System"].map((badge, i) => (
                <div key={i} className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] font-bold text-white border border-white/10">
                  <Check className="h-3 w-3 text-emerald-400" />
                  <span>{badge}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center gap-2 text-xs font-bold text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Wallet: ₦248,500.00</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-8">
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary dark:text-indigo-400" />
            Place Your Order
          </h3>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">1</span>
              Choose Domain Extension
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { ext: ".com", price: "₦400,000", tag: "Global reach" },
                { ext: ".ng", price: "₦360,000", tag: "Nigeria focused" },
                { ext: ".com.ng", price: "₦320,000", tag: "Best of both" },
              ].map((domain) => (
                <div 
                  key={domain.ext}
                  onClick={() => setSelectedDomain(domain.ext)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center text-center gap-1 ${
                    selectedDomain === domain.ext
                      ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-sm"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <span className="text-lg font-black text-slate-900 dark:text-white">{domain.ext}</span>
                  <span className="text-base font-extrabold text-primary dark:text-indigo-400">{domain.price}</span>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{domain.tag}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">2</span>
              Preferred Website Name
            </label>
            <div className="flex items-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20">
              <span className="px-4 py-3.5 text-xs font-bold text-slate-400 dark:text-slate-500 border-r border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80">www.</span>
              <Input 
                value={domainName}
                onChange={(e) => setDomainName(e.target.value)}
                placeholder="yoursite" 
                className="border-0 bg-transparent h-12 font-bold text-slate-900 dark:text-white focus-visible:ring-0 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              <span className="px-4 py-3.5 text-xs font-black text-primary dark:text-indigo-400 border-l border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80">{selectedDomain}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">3</span>
              Contact Details
            </label>
            <Input 
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="WhatsApp / phone e.g. 08012345678" 
              className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            {affiliateSubmitted ? (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-center font-bold text-sm">
                🎉 Order Received! Our engineering team will contact your WhatsApp within 2 hours.
              </div>
            ) : (
              <Button 
                onClick={() => setAffiliateSubmitted(true)}
                className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-base shadow-lg shadow-primary/25"
              >
                Place Order Now
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24 md:pb-12 pt-2 md:pt-6 px-4">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => router.back()}
          className="h-10 w-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-slate-700 dark:text-slate-200" />
        </button>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white capitalize">
          {decodeURIComponent(rawSlug).replace(/-/g, ' ')}
        </h1>
      </div>
      <Card className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6">
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Service configuration ready.</p>
      </Card>
    </div>
  );
}
