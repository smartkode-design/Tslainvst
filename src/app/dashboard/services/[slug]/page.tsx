"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, CheckCircle2, ChevronDown, Smartphone, Globe, ShieldCheck, Zap, 
  Copy, Clock, MessageSquare, Check, Wifi, Tv, Contact, Sparkles, AlertCircle,
  Radio, CheckCircle, Shield, ArrowRight, Flame, HelpCircle, Layers, Star,
  TrendingUp, RefreshCw, Info, ExternalLink, ShieldAlert, BadgeCheck,
  Search, X, Mail
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useAuth } from "../../layout";
import { calculateSmsPrice, isServiceSupportedInCountry } from "@/lib/pricing";
import { TransactionPinModal } from "@/components/TransactionPinModal";

function sanitizeClientErrorMessage(msg: string): string {
  if (!msg) return "Service route is temporarily unavailable. Please try another carrier or try again shortly.";
  const lower = msg.toLowerCase();
  if (
    lower.includes("5sim") ||
    lower.includes("jap") ||
    lower.includes("provider error") ||
    lower.includes("api error") ||
    lower.includes("not enough user balance") ||
    lower.includes("not enough balance")
  ) {
    return "This carrier route is temporarily unavailable or out of stock. Please select another country or try again shortly.";
  }
  return msg;
}

export default function ServicePage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const pathname = usePathname();
  const rawSlug = pathname.split('/').pop() || "";
  const slug = rawSlug.toLowerCase();
  const { user, wallet } = useAuth();
  const formattedBalance = new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(wallet?.balance ?? 0);

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
  const [selectedOtpService, setSelectedOtpService] = useState("googlevoice");
  const [selectedOtpCountry, setSelectedOtpCountry] = useState("us");
  const [otpSearchQuery, setOtpSearchQuery] = useState("");
  const [otpFilterTab, setOtpFilterTab] = useState<"all" | "hot" | "messaging" | "ai" | "social" | "finance">("all");
  const [hasGeneratedNumber, setHasGeneratedNumber] = useState(false);
  const [smsTimer, setSmsTimer] = useState(1185); // 19m 45s
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [smsReceived, setSmsReceived] = useState(false);
  const [receivedSmsCode, setReceivedSmsCode] = useState<string>("");
  const [receivedSmsText, setReceivedSmsText] = useState<string>("");
  const [isCancelingSms, setIsCancelingSms] = useState(false);
  const [generatedPhone, setGeneratedPhone] = useState<string>("");
  const [smsOrderId, setSmsOrderId] = useState<string | number>("");
  const [systemOrderId, setSystemOrderId] = useState<string>("");
  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [isGeneratingNumber, setIsGeneratingNumber] = useState(false);
  const [smsError, setSmsError] = useState<string | null>(null);

  // --- SMM Boost (Paxplug) Rich State ---
  const [selectedSmmPlatform, setSelectedSmmPlatform] = useState("instagram");
  const [smmCategory, setSmmCategory] = useState("followers");
  const [selectedSmmServiceId, setSelectedSmmServiceId] = useState("ig-fol-fast");
  const [smmLink, setSmmLink] = useState("");
  const [smmQuantity, setSmmQuantity] = useState("1000");
  const [smmSuccess, setSmmSuccess] = useState(false);
  const [isSubmittingSmm, setIsSubmittingSmm] = useState(false);
  const [smmError, setSmmError] = useState<string | null>(null);
  const [smmPlacedOrder, setSmmPlacedOrder] = useState<any>(null);

  // --- Affiliate Site State ---
  const [selectedDomain, setSelectedDomain] = useState(".com");
  const [domainName, setDomainName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [affiliateSubmitted, setAffiliateSubmitted] = useState(false);

  // --- Security 4-Digit PIN Modal State ---
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => Promise<void>) | null>(null);
  const [pinModalAmount, setPinModalAmount] = useState<number>(0);
  const [pinModalDesc, setPinModalDesc] = useState<string>("");

  // --- Dynamic Pricing from Admin ---
  const [dynamicPricing, setDynamicPricing] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("/api/admin/pricing")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.pricing) {
          const map: Record<string, number> = {};
          data.pricing.forEach((item: any) => {
            map[item.id] = Number(item.retailNGN);
          });
          if (data.overrides) {
            Object.assign(map, data.overrides);
          }
          setDynamicPricing(map);
        }
      })
      .catch((err) => console.warn("Could not load dynamic pricing", err));
  }, []);

  useEffect(() => {
    if (slug.includes("log")) {
      router.replace("/marketplace");
    }
  }, [slug, router]);

  // SMS Countdown timer & auto-cancel on timeout
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (hasGeneratedNumber && smsTimer > 0) {
      interval = setInterval(() => setSmsTimer((prev) => prev - 1), 1000);
    } else if (hasGeneratedNumber && smsTimer === 0 && !smsReceived && smsOrderId) {
      // Auto-cancel and refund when timeout reached
      fetch("/api/services/sms/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: smsOrderId }),
      }).finally(() => {
        setHasGeneratedNumber(false);
        setSmsOrderId("");
        setGeneratedPhone("");
        setSmsReceived(false);
        setReceivedSmsCode("");
        setSmsError("Session timed out. 100% refund has been credited back to your wallet.");
      });
    }
    return () => clearInterval(interval);
  }, [hasGeneratedNumber, smsTimer, smsReceived, smsOrderId]);

  // Real-time polling for actual incoming SMS from carrier
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;
    if (hasGeneratedNumber && smsOrderId && !smsReceived) {
      const pollSms = async () => {
        try {
          const res = await fetch(`/api/services/sms/check?orderId=${smsOrderId}`);
          const data = await res.json();
          if (data.status === "RECEIVED" && data.code) {
            setReceivedSmsCode(data.code);
            setReceivedSmsText(data.text || "");
            setSmsReceived(true);
          } else if (data.status === "CANCELED" || data.status === "TIMEOUT") {
            setHasGeneratedNumber(false);
            setSmsReceived(false);
            setSmsOrderId("");
            setGeneratedPhone("");
            setReceivedSmsCode("");
            setSmsError("Order expired or was canceled. Any balance debited has been refunded.");
          }
        } catch (e) {
          console.warn("SMS check poll error:", e);
        }
      };

      // Poll immediately, then every 3 seconds
      pollSms();
      pollInterval = setInterval(pollSms, 3000);
    }
    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [hasGeneratedNumber, smsOrderId, smsReceived]);

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
    { id: "twitter", name: "Twitter / X", icon: "🐦", color: "from-slate-950 to-slate-800", border: "border-slate-900" },
    { id: "youtube", name: "YouTube", icon: "▶️", color: "from-red-600 to-rose-700", border: "border-red-600" },
    { id: "telegram", name: "Telegram", icon: "✈️", color: "from-sky-400 to-blue-600", border: "border-sky-500" },
    { id: "facebook", name: "Facebook", icon: "📘", color: "from-blue-600 to-indigo-700", border: "border-blue-600" },
    { id: "spotify", name: "Spotify", icon: "🎧", color: "from-emerald-600 to-green-700", border: "border-emerald-600" },
    { id: "audiomack", name: "Audiomack", icon: "🔊", color: "from-orange-500 to-amber-600", border: "border-orange-500" },
    { id: "snapchat", name: "Snapchat", icon: "👻", color: "from-yellow-400 to-amber-500", border: "border-yellow-400" },
    { id: "threads", name: "Threads", icon: "🧵", color: "from-slate-900 to-black", border: "border-slate-900" },
    { id: "discord", name: "Discord", icon: "🎮", color: "from-indigo-600 to-purple-700", border: "border-indigo-600" },
    { id: "linkedin", name: "LinkedIn", icon: "💼", color: "from-blue-700 to-sky-800", border: "border-blue-700" },
    { id: "twitch", name: "Twitch", icon: "🟣", color: "from-purple-600 to-fuchsia-700", border: "border-purple-600" },
    { id: "kick", name: "Kick", icon: "🟢", color: "from-emerald-500 to-green-600", border: "border-emerald-500" },
    { id: "pinterest", name: "Pinterest", icon: "📌", color: "from-red-500 to-rose-600", border: "border-red-500" },
  ];

  const smmServices = [
    // Instagram
    {
      id: "ig-fol-fast",
      platform: "instagram",
      category: "followers",
      quality: "HIGH",
      qualityColor: "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/60",
      name: "Instagram Followers [Super Fast 50k/Day | 90 Days Auto-Refill | High Quality]",
      speed: "50k/Day",
      minMax: "100 - 500,000",
      rate: 3850,
      badge: "Best Seller"
    },
    {
      id: "ig-fol-nigerian",
      platform: "instagram",
      category: "followers",
      quality: "FARM",
      qualityColor: "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900/60",
      name: "Instagram Followers [100% Real Active Nigerian Profiles | Organic Growth]",
      speed: "5k/Day",
      minMax: "50 - 20,000",
      rate: 6800,
      badge: "100% Naija Active"
    },
    {
      id: "ig-fol-guaranteed",
      platform: "instagram",
      category: "followers",
      quality: "HIGH",
      qualityColor: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60",
      name: "Instagram Followers [Non-Drop Auto-Refill | 365 Days Lifetime Guarantee | Real HQ]",
      speed: "3k/Day",
      minMax: "100 - 500,000",
      rate: 14500,
      badge: "365D Lifetime Guarantee"
    },
    {
      id: "ig-lik-hq",
      platform: "instagram",
      category: "likes",
      quality: "HIGH",
      qualityColor: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60",
      name: "Instagram HQ Likes [Instant 0-5m | Non-Drop Real Profiles]",
      speed: "100k/Day",
      minMax: "50 - 100,000",
      rate: 550,
      badge: "Instant 0-5m"
    },
    {
      id: "ig-viw-reels",
      platform: "instagram",
      category: "views",
      quality: "LOW",
      qualityColor: "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/60",
      name: "Instagram Reel & Video Views [Algorithm FYP Booster | High Reach]",
      speed: "500k/Day",
      minMax: "500 - 1,000,000",
      rate: 350,
      badge: "Viral FYP"
    },
    {
      id: "ig-com-custom",
      platform: "instagram",
      category: "comments",
      quality: "PROVIDER",
      qualityColor: "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/60",
      name: "Instagram Custom Comments [Targeted Active Profiles | Custom Text]",
      speed: "1k/Day",
      minMax: "10 - 2,000",
      rate: 5800,
      badge: "Custom Text"
    },
    {
      id: "ig-viw-story",
      platform: "instagram",
      category: "views",
      quality: "MEDIUM",
      qualityColor: "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/60",
      name: "Instagram Story Views & Impressions [All Active Stories]",
      speed: "50k/Day",
      minMax: "100 - 50,000",
      rate: 650,
      badge: "100% Reach"
    },
    {
      id: "ig-sav-shares",
      platform: "instagram",
      category: "shares",
      quality: "HIGH",
      qualityColor: "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900/60",
      name: "Instagram Saves & Shares [Algorithm Explore Pusher]",
      speed: "20k/Day",
      minMax: "100 - 100,000",
      rate: 750,
      badge: "Explore Boost"
    },

    // TikTok
    {
      id: "tt-fol-instant",
      platform: "tiktok",
      category: "followers",
      quality: "HIGH",
      qualityColor: "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/60",
      name: "TikTok Followers [Instant Start | 30 Days Auto-Refill | Real Profiles]",
      speed: "30k/Day",
      minMax: "100 - 100,000",
      rate: 4200,
      badge: "Best Seller"
    },
    {
      id: "tt-fol-nigerian",
      platform: "tiktok",
      category: "followers",
      quality: "FARM",
      qualityColor: "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900/60",
      name: "TikTok Nigerian / African Followers [Real Organic Profiles]",
      speed: "3k/Day",
      minMax: "50 - 20,000",
      rate: 7200,
      badge: "Naija Real"
    },
    {
      id: "tt-lik-instant",
      platform: "tiktok",
      category: "likes",
      quality: "HIGH",
      qualityColor: "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900/60",
      name: "TikTok Video Likes [VIP Instant Start 🔥 | 30-Day Refill Guaranteed]",
      speed: "10k/Day",
      minMax: "10 - 50,000",
      rate: 3800,
      badge: "VIP Instant 🔥"
    },
    {
      id: "tt-lik-ultra",
      platform: "tiktok",
      category: "likes",
      quality: "HIGH",
      qualityColor: "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/60",
      name: "TikTok Video Likes [Ultra Speed 300k/Day | Fast Active Profiles]",
      speed: "300k/Day",
      minMax: "10 - 50,000",
      rate: 2450,
      badge: "Ultra Fast ⚡"
    },
    {
      id: "tt-lik-fast",
      platform: "tiktok",
      category: "likes",
      quality: "MEDIUM",
      qualityColor: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60",
      name: "TikTok Video Likes [High Speed 5k/Hour | Fast Worker Pool]",
      speed: "5k/Hour",
      minMax: "10 - 5,000",
      rate: 1500,
      badge: "Fast 5k/Hr"
    },
    {
      id: "tt-lik-real",
      platform: "tiktok",
      category: "likes",
      quality: "LOW",
      qualityColor: "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/60",
      name: "TikTok Video Likes [Economy Saver | Standard Queue (1-2 Hrs)]",
      speed: "10k/Day",
      minMax: "50 - 50,000",
      rate: 950,
      badge: "Economy Saver"
    },
    {
      id: "tt-viw-viral",
      platform: "tiktok",
      category: "views",
      quality: "LOW",
      qualityColor: "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/60",
      name: "TikTok Viral FYP Video Views [Algorithmic For-You-Page Pusher]",
      speed: "500k/Day",
      minMax: "1,000 - 10,000,000",
      rate: 320,
      badge: "Ultra Fast"
    },
    {
      id: "tt-shr-bookmarks",
      platform: "tiktok",
      category: "shares",
      quality: "MEDIUM",
      qualityColor: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60",
      name: "TikTok Video Shares & Bookmarks [Algorithm Virality Booster]",
      speed: "20k/Day",
      minMax: "100 - 100,000",
      rate: 750,
      badge: "High Retention"
    },
    {
      id: "tt-viw-live",
      platform: "tiktok",
      category: "views",
      quality: "HIGH",
      qualityColor: "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/60",
      name: "TikTok Live Stream Viewers [Instant 60 Mins High Retention]",
      speed: "Instant",
      minMax: "50 - 5,000",
      rate: 3800,
      badge: "Live Viewers"
    },
    {
      id: "tt-com-custom",
      platform: "tiktok",
      category: "comments",
      quality: "PROVIDER",
      qualityColor: "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/60",
      name: "TikTok Custom Comments [Targeted Active Profiles]",
      speed: "1k/Day",
      minMax: "10 - 2,000",
      rate: 6200,
      badge: "Custom Text"
    },

    // Twitter / X
    {
      id: "tw-fol-hq",
      platform: "twitter",
      category: "followers",
      quality: "HIGH",
      qualityColor: "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/60",
      name: "Twitter / X Followers [High Quality Real Profiles | 30-Day Refill Guaranteed]",
      speed: "2.5k/Day",
      minMax: "50 - 25,000",
      rate: 7500,
      badge: "30D Refill"
    },
    {
      id: "tw-fol-fast",
      platform: "twitter",
      category: "followers",
      quality: "MEDIUM",
      qualityColor: "bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-900/60",
      name: "Twitter / X Fast Followers [Starter Pack | Non-Drop]",
      speed: "5k/Day",
      minMax: "100 - 10,000",
      rate: 4200,
      badge: "Best Value"
    },
    {
      id: "tw-lik-hq",
      platform: "twitter",
      category: "likes",
      quality: "HIGH",
      qualityColor: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60",
      name: "Twitter / X Likes & Favorites [Instant High Quality Non-Drop]",
      speed: "10k/Day",
      minMax: "50 - 20,000",
      rate: 1900,
      badge: "Non-Drop"
    },
    {
      id: "tw-rt-reposts",
      platform: "twitter",
      category: "retweets",
      quality: "HIGH",
      qualityColor: "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900/60",
      name: "Twitter / X Retweets & Reposts [Trending Algorithm Push]",
      speed: "5k/Day",
      minMax: "50 - 10,000",
      rate: 2500,
      badge: "Trending Push"
    },
    {
      id: "tw-imp-visits",
      platform: "twitter",
      category: "impressions",
      quality: "LOW",
      qualityColor: "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/60",
      name: "Twitter / X Impressions & Profile Visits [Monetization Ready]",
      speed: "100k/Day",
      minMax: "500 - 500,000",
      rate: 650,
      badge: "Monetization Ready"
    },
    {
      id: "tw-pol-votes",
      platform: "twitter",
      category: "votes",
      quality: "HIGH",
      qualityColor: "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/60",
      name: "Twitter / X Poll Votes [Custom Choice Option]",
      speed: "10k/Day",
      minMax: "100 - 25,000",
      rate: 3200,
      badge: "Instant Votes"
    },

    // Telegram
    {
      id: "tg-mem-lifetime",
      platform: "telegram",
      category: "members",
      quality: "HIGH",
      qualityColor: "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/60",
      name: "Telegram Channel & Group Members [Zero Drop | 365 Days Lifetime Guarantee]",
      speed: "20k/Day",
      minMax: "100 - 50,000",
      rate: 3900,
      badge: "Lifetime Refill"
    },
    {
      id: "tg-mem-nigerian",
      platform: "telegram",
      category: "members",
      quality: "FARM",
      qualityColor: "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900/60",
      name: "Telegram Real Nigerian Targeted Members [Crypto & Forex Active]",
      speed: "3k/Day",
      minMax: "50 - 15,000",
      rate: 6800,
      badge: "100% Naija Active"
    },
    {
      id: "tg-viw-posts",
      platform: "telegram",
      category: "views",
      quality: "LOW",
      qualityColor: "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/60",
      name: "Telegram Post Views [Instant Delivery across Recent Posts]",
      speed: "100k/Day",
      minMax: "200 - 100,000",
      rate: 350,
      badge: "Instant"
    },
    {
      id: "tg-rea-positive",
      platform: "telegram",
      category: "reactions",
      quality: "HIGH",
      qualityColor: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60",
      name: "Telegram Post Reactions [Positive Fire / Heart / Thumbs Up]",
      speed: "10k/Day",
      minMax: "50 - 20,000",
      rate: 550,
      badge: "Positive Emojis"
    },

    // YouTube
    {
      id: "yt-sub-safe",
      platform: "youtube",
      category: "subscribers",
      quality: "HIGH",
      qualityColor: "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/60",
      name: "YouTube Subscribers [100% Non-Drop | Channel Monetization Safe Guaranteed]",
      speed: "200/Day",
      minMax: "50 - 5,000",
      rate: 9800,
      badge: "Monetization Safe"
    },
    {
      id: "yt-viw-retention",
      platform: "youtube",
      category: "views",
      quality: "HIGH",
      qualityColor: "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/60",
      name: "YouTube High Retention Views [3-5 Mins Watch Time | Ranking Booster]",
      speed: "5k/Day",
      minMax: "500 - 100,000",
      rate: 3400,
      badge: "High Watch Time"
    },
    {
      id: "yt-lik-nondrop",
      platform: "youtube",
      category: "likes",
      quality: "HIGH",
      qualityColor: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60",
      name: "YouTube Video Likes [Permanent High Quality Non-Drop]",
      speed: "2k/Day",
      minMax: "50 - 15,000",
      rate: 1900,
      badge: "Lifetime"
    },
    {
      id: "yt-com-custom",
      platform: "youtube",
      category: "comments",
      quality: "PROVIDER",
      qualityColor: "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/60",
      name: "YouTube Custom Comments [Targeted English & Active Channels]",
      speed: "500/Day",
      minMax: "10 - 2,000",
      rate: 6500,
      badge: "Custom Text"
    },

    // Facebook
    {
      id: "fb-fol-page",
      platform: "facebook",
      category: "followers",
      quality: "HIGH",
      qualityColor: "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/60",
      name: "Facebook Page Likes & Followers [Non-Drop 60D Refill Guaranteed]",
      speed: "2k/Day",
      minMax: "100 - 50,000",
      rate: 4500,
      badge: "60D Refill"
    },
    {
      id: "fb-lik-reactions",
      platform: "facebook",
      category: "likes",
      quality: "HIGH",
      qualityColor: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60",
      name: "Facebook Post Likes & Reactions [Instant Love / Care / Like]",
      speed: "5k/Day",
      minMax: "50 - 20,000",
      rate: 1500,
      badge: "Instant"
    },
    {
      id: "fb-viw-reels",
      platform: "facebook",
      category: "views",
      quality: "LOW",
      qualityColor: "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/60",
      name: "Facebook Video & Reel Views [Fast Algorithm Reach Booster]",
      speed: "100k/Day",
      minMax: "500 - 500,000",
      rate: 600,
      badge: "Ultra Fast"
    },
    {
      id: "fb-grp-members",
      platform: "facebook",
      category: "members",
      quality: "HIGH",
      qualityColor: "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/60",
      name: "Facebook Group Members [Active Profiles Non-Drop]",
      speed: "1k/Day",
      minMax: "100 - 25,000",
      rate: 4800,
      badge: "Group Growth"
    },

    // Spotify
    {
      id: "sp-str-royalty",
      platform: "spotify",
      category: "streams",
      quality: "HIGH",
      qualityColor: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60",
      name: "Spotify Premium Track Streams [USA/EU Royalty Eligible | High Retention]",
      speed: "10k/Day",
      minMax: "1,000 - 500,000",
      rate: 3400,
      badge: "Royalty Eligible"
    },
    {
      id: "sp-fol-artist",
      platform: "spotify",
      category: "followers",
      quality: "HIGH",
      qualityColor: "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/60",
      name: "Spotify Artist Profile Followers [Non-Drop Playlist Pitch Ready]",
      speed: "3k/Day",
      minMax: "100 - 50,000",
      rate: 3100,
      badge: "Non-Drop"
    },
    {
      id: "sp-lis-monthly",
      platform: "spotify",
      category: "listeners",
      quality: "HIGH",
      qualityColor: "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900/60",
      name: "Spotify Monthly Listeners [Algorithm Radio Booster]",
      speed: "5k/Day",
      minMax: "500 - 100,000",
      rate: 3600,
      badge: "Radio Boost"
    },

    // Audiomack
    {
      id: "audiomack-song-streams",
      platform: "audiomack",
      category: "streams",
      quality: "HIGH",
      qualityColor: "bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-900/60",
      name: "Audiomack Song Plays / Streams [Nigerian Top Trending Chart Booster]",
      speed: "50k/Day",
      minMax: "500 - 1,000,000",
      rate: 1950,
      badge: "Chart Booster"
    },
    {
      id: "audiomack-artist-followers",
      platform: "audiomack",
      category: "followers",
      quality: "HIGH",
      qualityColor: "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/60",
      name: "Audiomack Artist Profile Followers & Song Re-ups",
      speed: "5k/Day",
      minMax: "100 - 50,000",
      rate: 2800,
      badge: "Organic"
    },

    // Snapchat
    {
      id: "snapchat-followers-public",
      platform: "snapchat",
      category: "followers",
      quality: "HIGH",
      qualityColor: "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/60",
      name: "Snapchat Public Profile Followers & Subscribers [30D Refill]",
      speed: "1k/Day",
      minMax: "50 - 15,000",
      rate: 4800,
      badge: "30D Refill"
    },
    {
      id: "snapchat-story-views",
      platform: "snapchat",
      category: "views",
      quality: "LOW",
      qualityColor: "bg-yellow-50 dark:bg-yellow-950/60 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-900/60",
      name: "Snapchat Spotlight & Story Views [Viral Booster]",
      speed: "50k/Day",
      minMax: "500 - 100,000",
      rate: 950,
      badge: "Ultra Fast"
    },

    // Threads
    {
      id: "threads-followers-instant",
      platform: "threads",
      category: "followers",
      quality: "HIGH",
      qualityColor: "bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700",
      name: "Meta Threads Followers [Instant Non-Drop Accounts]",
      speed: "10k/Day",
      minMax: "100 - 50,000",
      rate: 3800,
      badge: "Non-Drop"
    },
    {
      id: "threads-likes-reposts",
      platform: "threads",
      category: "likes",
      quality: "HIGH",
      qualityColor: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60",
      name: "Meta Threads Post Likes & Algorithmic Reposts",
      speed: "5k/Day",
      minMax: "50 - 20,000",
      rate: 1400,
      badge: "Instant"
    },

    // Discord
    {
      id: "discord-members-online",
      platform: "discord",
      category: "members",
      quality: "HIGH",
      qualityColor: "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/60",
      name: "Discord Server Members [Online Active / Green Status Profiles]",
      speed: "2k/Day",
      minMax: "100 - 10,000",
      rate: 4200,
      badge: "Online Status"
    },
    {
      id: "discord-members-offline",
      platform: "discord",
      category: "members",
      quality: "LOW",
      qualityColor: "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
      name: "Discord Server Members [Offline Non-Drop Community Booster]",
      speed: "5k/Day",
      minMax: "100 - 25,000",
      rate: 2600,
      badge: "Budget Friendly"
    },

    // LinkedIn
    {
      id: "linkedin-company-followers",
      platform: "linkedin",
      category: "followers",
      quality: "PROVIDER",
      qualityColor: "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/60",
      name: "LinkedIn Company Page & Professional Followers",
      speed: "500/Day",
      minMax: "50 - 10,000",
      rate: 8500,
      badge: "Corporate Grade"
    },
    {
      id: "linkedin-post-likes",
      platform: "linkedin",
      category: "likes",
      quality: "HIGH",
      qualityColor: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60",
      name: "LinkedIn Post Likes & Thought Leadership Reactions",
      speed: "1k/Day",
      minMax: "50 - 5,000",
      rate: 3200,
      badge: "Fast Delivery"
    },

    // Twitch
    {
      id: "twitch-channel-followers",
      platform: "twitch",
      category: "followers",
      quality: "HIGH",
      qualityColor: "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900/60",
      name: "Twitch Channel Followers [Affiliate Status Safe]",
      speed: "5k/Day",
      minMax: "50 - 20,000",
      rate: 3200,
      badge: "Affiliate Safe"
    },
    {
      id: "twitch-live-stream-viewers",
      platform: "twitch",
      category: "views",
      quality: "HIGH",
      qualityColor: "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/60",
      name: "Twitch Live Stream Viewers [60 Mins High Retention]",
      speed: "Instant",
      minMax: "50 - 5,000",
      rate: 3900,
      badge: "Live Viewers"
    },

    // Kick
    {
      id: "kick-channel-followers",
      platform: "kick",
      category: "followers",
      quality: "HIGH",
      qualityColor: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60",
      name: "Kick.com Channel Followers [Instant Start Non-Drop]",
      speed: "3k/Day",
      minMax: "50 - 15,000",
      rate: 3600,
      badge: "Instant Start"
    },
    {
      id: "kick-live-stream-viewers",
      platform: "kick",
      category: "views",
      quality: "HIGH",
      qualityColor: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60",
      name: "Kick.com Live Stream Viewers [60 Mins Stable Homepage Booster]",
      speed: "Instant",
      minMax: "50 - 2,000",
      rate: 4500,
      badge: "Live Viewers"
    },

    // Pinterest
    {
      id: "pinterest-followers",
      platform: "pinterest",
      category: "followers",
      quality: "HIGH",
      qualityColor: "bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900/60",
      name: "Pinterest Board & Profile Followers [Active Lifestyle Pins]",
      speed: "2k/Day",
      minMax: "100 - 20,000",
      rate: 3400,
      badge: "Non-Drop"
    },
    {
      id: "pinterest-repins-saves",
      platform: "pinterest",
      category: "repins",
      quality: "HIGH",
      qualityColor: "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/60",
      name: "Pinterest Pin Saves & Repins [Referral Traffic Multiplier]",
      speed: "5k/Day",
      minMax: "100 - 25,000",
      rate: 1600,
      badge: "Traffic Boost"
    },
  ];

  // -------------------------------------------------------------
  // -------------------------------------------------------------
  // VIRTUAL NUMBER SERVICES & COUNTRIES DATA (OTPClouds Reference)
  // -------------------------------------------------------------
  const otpServices = [
    { 
      id: "googlevoice", 
      name: "Google Voice", 
      icon: "📞", 
      startingPrice: dynamicPricing["sms_googlevoice"] ? `₦${dynamicPricing["sms_googlevoice"].toLocaleString()}` : "₦3,500", 
      popular: true, 
      badge: "🔥 HOT", 
      category: "voice",
      description: "USA non-VoIP carrier route for Google Voice number setup" 
    },
    { 
      id: "signal", 
      name: "Signal Messenger", 
      icon: "💬", 
      startingPrice: dynamicPricing["sms_signal"] ? `₦${dynamicPricing["sms_signal"].toLocaleString()}` : "₦900", 
      popular: true, 
      badge: "🔒 PRIVATE", 
      category: "messaging",
      description: "Encrypted private 2FA SMS route for Signal" 
    },
    { 
      id: "whatsapp", 
      name: "WhatsApp", 
      icon: "🟢", 
      startingPrice: dynamicPricing["sms_whatsapp"] ? `₦${dynamicPricing["sms_whatsapp"].toLocaleString()}` : "₦1,400", 
      popular: true, 
      badge: "⭐ INSTANT", 
      category: "messaging",
      description: "WhatsApp & WhatsApp Business SMS activation" 
    },
    { 
      id: "telegram", 
      name: "Telegram", 
      icon: "✈️", 
      startingPrice: dynamicPricing["sms_telegram"] ? `₦${dynamicPricing["sms_telegram"].toLocaleString()}` : "₦2,250", 
      popular: true, 
      badge: "⭐ INSTANT", 
      category: "messaging",
      description: "Instant OTP for Telegram registration" 
    },
    { 
      id: "openai", 
      name: "OpenAI / ChatGPT", 
      icon: "🤖", 
      startingPrice: dynamicPricing["sms_openai"] ? `₦${dynamicPricing["sms_openai"].toLocaleString()}` : "₦1,350", 
      popular: true, 
      badge: "AI", 
      category: "ai",
      description: "OpenAI API & ChatGPT Plus verification" 
    },
    { 
      id: "claude", 
      name: "Claude AI (Anthropic)", 
      icon: "🔮", 
      startingPrice: dynamicPricing["sms_claude"] ? `₦${dynamicPricing["sms_claude"].toLocaleString()}` : "₦1,350", 
      popular: true, 
      badge: "AI", 
      category: "ai",
      description: "Claude.ai Anthropic verification" 
    },
    { 
      id: "google", 
      name: "Google / Gmail", 
      icon: "🔴", 
      startingPrice: dynamicPricing["sms_google"] ? `₦${dynamicPricing["sms_google"].toLocaleString()}` : "₦900", 
      popular: true, 
      badge: "CLEAN", 
      category: "ai",
      description: "New Gmail and Google Workspace accounts" 
    },
    { 
      id: "discord", 
      name: "Discord", 
      icon: "🎮", 
      startingPrice: dynamicPricing["sms_discord"] ? `₦${dynamicPricing["sms_discord"].toLocaleString()}` : "₦850", 
      popular: true, 
      category: "messaging" 
    },
    { id: "twitter", name: "Twitter / X", icon: "🐦", startingPrice: dynamicPricing["sms_twitter"] ? `₦${dynamicPricing["sms_twitter"].toLocaleString()}` : "₦850", popular: false, category: "social" },
    { id: "tiktok", name: "TikTok", icon: "🎵", startingPrice: dynamicPricing["sms_tiktok"] ? `₦${dynamicPricing["sms_tiktok"].toLocaleString()}` : "₦800", popular: false, category: "social" },
    { id: "instagram", name: "Instagram", icon: "📸", startingPrice: dynamicPricing["sms_instagram"] ? `₦${dynamicPricing["sms_instagram"].toLocaleString()}` : "₦850", popular: false, category: "social" },
    { id: "facebook", name: "Facebook", icon: "📘", startingPrice: dynamicPricing["sms_facebook"] ? `₦${dynamicPricing["sms_facebook"].toLocaleString()}` : "₦850", popular: false, category: "social" },
    { id: "apple", name: "Apple ID / iCloud", icon: "🍏", startingPrice: dynamicPricing["sms_apple"] ? `₦${dynamicPricing["sms_apple"].toLocaleString()}` : "₦1,400", popular: false, category: "ai" },
    { id: "netflix", name: "Netflix", icon: "🍿", startingPrice: dynamicPricing["sms_netflix"] ? `₦${dynamicPricing["sms_netflix"].toLocaleString()}` : "₦950", popular: false, category: "social" },
    { id: "paypal", name: "PayPal", icon: "💳", startingPrice: dynamicPricing["sms_paypal"] ? `₦${dynamicPricing["sms_paypal"].toLocaleString()}` : "₦1,600", popular: false, category: "finance" },
    { id: "steam", name: "Steam", icon: "🎯", startingPrice: dynamicPricing["sms_steam"] ? `₦${dynamicPricing["sms_steam"].toLocaleString()}` : "₦900", popular: false, category: "finance" },
    { id: "amazon", name: "Amazon", icon: "📦", startingPrice: dynamicPricing["sms_amazon"] ? `₦${dynamicPricing["sms_amazon"].toLocaleString()}` : "₦1,100", popular: false, category: "finance" },
    { id: "uber", name: "Uber", icon: "🚗", startingPrice: dynamicPricing["sms_uber"] ? `₦${dynamicPricing["sms_uber"].toLocaleString()}` : "₦850", popular: false, category: "finance" },
    { id: "microsoft", name: "Microsoft / Outlook", icon: "💻", startingPrice: dynamicPricing["sms_microsoft"] ? `₦${dynamicPricing["sms_microsoft"].toLocaleString()}` : "₦900", popular: false, category: "ai" },
    { id: "snapchat", name: "Snapchat", icon: "👻", startingPrice: dynamicPricing["sms_snapchat"] ? `₦${dynamicPricing["sms_snapchat"].toLocaleString()}` : "₦800", popular: false, category: "social" },
    { id: "tinder", name: "Tinder", icon: "🔥", startingPrice: dynamicPricing["sms_tinder"] ? `₦${dynamicPricing["sms_tinder"].toLocaleString()}` : "₦1,200", popular: false, category: "social" },
    { id: "binance", name: "Binance", icon: "🪙", startingPrice: dynamicPricing["sms_binance"] ? `₦${dynamicPricing["sms_binance"].toLocaleString()}` : "₦1,500", popular: false, category: "finance" },
    { id: "spotify", name: "Spotify", icon: "🎧", startingPrice: dynamicPricing["sms_spotify"] ? `₦${dynamicPricing["sms_spotify"].toLocaleString()}` : "₦750", popular: false, category: "finance" },
    { id: "linkedin", name: "LinkedIn", icon: "💼", startingPrice: dynamicPricing["sms_linkedin"] ? `₦${dynamicPricing["sms_linkedin"].toLocaleString()}` : "₦1,300", popular: false, category: "finance" },
  ];

  const otpCountries = [
    { id: "us", name: "United States", code: "+1", flag: "https://flagcdn.com/w160/us.png", stock: "1,240 left", isPremium: true },
    { id: "gb", name: "United Kingdom", code: "+44", flag: "https://flagcdn.com/w160/gb.png", stock: "810 left", isPremium: true },
    { id: "au", name: "Australia", code: "+61", flag: "https://flagcdn.com/w160/au.png", stock: "340 left", isPremium: true },
    { id: "ca", name: "Canada", code: "+1", flag: "https://flagcdn.com/w160/ca.png", stock: "620 left", isPremium: true },
    { id: "de", name: "Germany", code: "+49", flag: "https://flagcdn.com/w160/de.png", stock: "490 left" },
    { id: "fr", name: "France", code: "+33", flag: "https://flagcdn.com/w160/fr.png", stock: "390 left" },
    { id: "nl", name: "Netherlands", code: "+31", flag: "https://flagcdn.com/w160/nl.png", stock: "280 left" },
    { id: "es", name: "Spain", code: "+34", flag: "https://flagcdn.com/w160/es.png", stock: "310 left" },
    { id: "pl", name: "Poland", code: "+48", flag: "https://flagcdn.com/w160/pl.png", stock: "420 left" },
    { id: "se", name: "Sweden", code: "+46", flag: "https://flagcdn.com/w160/se.png", stock: "210 left" },
    { id: "tr", name: "Turkey", code: "+90", flag: "https://flagcdn.com/w160/tr.png", stock: "550 left" },
    { id: "ng", name: "Nigeria", code: "+234", flag: "https://flagcdn.com/w160/ng.png", stock: "2,420 left" },
    { id: "gh", name: "Ghana", code: "+233", flag: "https://flagcdn.com/w160/gh.png", stock: "380 left" },
    { id: "za", name: "South Africa", code: "+27", flag: "https://flagcdn.com/w160/za.png", stock: "750 left" },
    { id: "ke", name: "Kenya", code: "+254", flag: "https://flagcdn.com/w160/ke.png", stock: "420 left" },
    { id: "in", name: "India", code: "+91", flag: "https://flagcdn.com/w160/in.png", stock: "1,620 left" },
    { id: "id", name: "Indonesia", code: "+62", flag: "https://flagcdn.com/w160/id.png", stock: "890 left" },
    { id: "ph", name: "Philippines", code: "+63", flag: "https://flagcdn.com/w160/ph.png", stock: "540 left" },
    { id: "my", name: "Malaysia", code: "+60", flag: "https://flagcdn.com/w160/my.png", stock: "380 left" },
    { id: "vn", name: "Vietnam", code: "+84", flag: "https://flagcdn.com/w160/vn.png", stock: "410 left" },
    { id: "br", name: "Brazil", code: "+55", flag: "https://flagcdn.com/w160/br.png", stock: "680 left" },
  ];

  // -------------------------------------------------------------
  // 1. RICH VIRTUAL NUMBER (SMS OTP) FLOW (OTPClouds / Primex)
  // -------------------------------------------------------------
  if (slug.includes("virtual") || slug.includes("rent-number")) {
    const activeCountryObj = otpCountries.find(c => c.id === selectedOtpCountry) || otpCountries[0];
    const activeServiceObj = otpServices.find(s => s.id === selectedOtpService) || otpServices[0];
    
    // Dynamic order rate computed from authoritative matrix
    const activeOrderRate = calculateSmsPrice(selectedOtpService, selectedOtpCountry, dynamicPricing);

    // Filter services according to user search and selected category tab
    const filteredOtpServices = otpServices.filter((srv) => {
      const q = otpSearchQuery.trim().toLowerCase();
      const matchesSearch = !q || srv.name.toLowerCase().includes(q) || srv.id.toLowerCase().includes(q);
      if (!matchesSearch) return false;
      if (otpFilterTab === "hot") return srv.id === "googlevoice" || srv.id === "signal" || srv.popular;
      if (otpFilterTab === "messaging") return ["googlevoice", "signal", "whatsapp", "telegram", "discord"].includes(srv.id);
      if (otpFilterTab === "ai") return ["openai", "claude", "google", "apple", "microsoft"].includes(srv.id);
      if (otpFilterTab === "social") return ["twitter", "tiktok", "instagram", "facebook", "snapchat", "tinder", "netflix"].includes(srv.id);
      if (otpFilterTab === "finance") return ["paypal", "binance", "amazon", "uber", "steam", "spotify", "linkedin"].includes(srv.id);
      return true;
    });

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
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">₦{formattedBalance}</div>
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
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{otpServices.length} Supported Apps</span>
          </div>

          {/* Quick Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={otpSearchQuery}
              onChange={(e) => setOtpSearchQuery(e.target.value)}
              placeholder="Search services (e.g. Google Voice, Signal, WhatsApp, Telegram)..."
              className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            {otpSearchQuery && (
              <button
                type="button"
                onClick={() => setOtpSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Quick Direct Select Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Fast Select:</span>
            <button
              type="button"
              onClick={() => { setSelectedOtpService("googlevoice"); setSelectedOtpCountry("us"); }}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 border shadow-2xs ${
                selectedOtpService === "googlevoice"
                  ? "bg-amber-500 text-white border-amber-500 ring-2 ring-amber-400/30 font-black"
                  : "bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-800/80 hover:bg-amber-100 dark:hover:bg-amber-950/60"
              }`}
            >
              <span>📞</span> Google Voice
              <span className="text-[9px] bg-amber-600/30 text-amber-950 dark:text-amber-100 px-1.5 py-0.5 rounded-full font-black uppercase">HOT</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedOtpService("signal")}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 border shadow-2xs ${
                selectedOtpService === "signal"
                  ? "bg-blue-600 text-white border-blue-600 ring-2 ring-blue-500/30 font-black"
                  : "bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-800/80 hover:bg-blue-100 dark:hover:bg-blue-950/60"
              }`}
            >
              <span>💬</span> Signal Messenger
              <span className="text-[9px] bg-blue-600/30 text-blue-950 dark:text-blue-100 px-1.5 py-0.5 rounded-full font-black uppercase">HOT</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedOtpService("whatsapp")}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 border shadow-2xs ${
                selectedOtpService === "whatsapp"
                  ? "bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-500/30 font-black"
                  : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-100"
              }`}
            >
              <span>🟢</span> WhatsApp
            </button>
            <button
              type="button"
              onClick={() => setSelectedOtpService("telegram")}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 border shadow-2xs ${
                selectedOtpService === "telegram"
                  ? "bg-sky-600 text-white border-sky-600 ring-2 ring-sky-500/30 font-black"
                  : "bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-300 border-sky-200 dark:border-sky-800/80 hover:bg-sky-100"
              }`}
            >
              <span>✈️</span> Telegram
            </button>
            <button
              type="button"
              onClick={() => setSelectedOtpService("openai")}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 border shadow-2xs ${
                selectedOtpService === "openai"
                  ? "bg-purple-600 text-white border-purple-600 ring-2 ring-purple-500/30 font-black"
                  : "bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-300 border-purple-200 dark:border-purple-800/80 hover:bg-purple-100"
              }`}
            >
              <span>🤖</span> ChatGPT
            </button>
          </div>

          {/* Filter Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-slate-100 dark:border-slate-800">
            {[
              { id: "all", label: "All Apps" },
              { id: "hot", label: "🔥 Top Demand" },
              { id: "messaging", label: "💬 Messaging" },
              { id: "ai", label: "🤖 AI & Tech" },
              { id: "social", label: "📱 Social Media" },
              { id: "finance", label: "💳 Finance" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setOtpFilterTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  otpFilterTab === tab.id
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Service Cards Grid */}
          {filteredOtpServices.length === 0 ? (
            <div className="py-8 text-center space-y-2 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">No service found matching "{otpSearchQuery}"</p>
              <button
                type="button"
                onClick={() => { setOtpSearchQuery(""); setOtpFilterTab("all"); }}
                className="text-xs font-bold text-primary hover:underline"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {filteredOtpServices.map((srv) => (
                <div
                  key={srv.id}
                  onClick={() => {
                    setSelectedOtpService(srv.id);
                    if (!isServiceSupportedInCountry(srv.id, selectedOtpCountry)) {
                      setSelectedOtpCountry("us");
                    }
                  }}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 relative ${
                    selectedOtpService === srv.id
                      ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-xs ring-2 ring-primary/20"
                      : "border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  {srv.badge && (
                    <span className={`absolute -top-2.5 right-2 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider text-white shadow-xs ${
                      srv.id === "googlevoice" ? "bg-amber-500" : srv.id === "signal" ? "bg-blue-600" : "bg-rose-500"
                    }`}>
                      {srv.badge}
                    </span>
                  )}
                  <span className="text-2xl">{srv.icon}</span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate">{srv.name}</span>
                    <span className="text-[10px] font-extrabold text-primary dark:text-indigo-400 mt-0.5">{srv.startingPrice}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Contextual Route Notes */}
          {selectedOtpService === "googlevoice" && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex items-start gap-3">
              <span className="text-xl shrink-0">📞</span>
              <div className="text-xs space-y-0.5">
                <p className="font-extrabold text-amber-950 dark:text-amber-200">Google Voice Route Active (+1 USA Non-VoIP Carrier)</p>
                <p className="text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed">
                  United States (+1) non-VoIP residential route auto-selected. Bypasses Google Voice VoIP blocks to deliver your 6-digit confirmation code seamlessly.
                </p>
              </div>
            </div>
          )}

          {selectedOtpService === "signal" && (
            <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 flex items-start gap-3">
              <span className="text-xl shrink-0">💬</span>
              <div className="text-xs space-y-0.5">
                <p className="font-extrabold text-blue-950 dark:text-blue-200">Signal Messenger Route Active</p>
                <p className="text-blue-800 dark:text-blue-300 text-[11px] leading-relaxed">
                  Private end-to-end encrypted SMS route ready. Compatible with United States (+1), United Kingdom (+44), Nigeria (+234) and all available country routes.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Country Selection Grid with Flag CDN */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">2</span>
              Select Country & Carrier Route
            </label>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                {otpCountries.filter(c => isServiceSupportedInCountry(selectedOtpService, c.id)).length} Active Routes
              </span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">All Non-VoIP</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {otpCountries.map((c) => {
              const isSupported = isServiceSupportedInCountry(selectedOtpService, c.id);
              const exactPrice = calculateSmsPrice(selectedOtpService, c.id, dynamicPricing);
              const isSelected = selectedOtpCountry === c.id;

              if (!isSupported) {
                return (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 opacity-40 cursor-not-allowed flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-6 rounded border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 grayscale">
                        <img src={c.flag} alt={c.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 leading-tight">{c.name}</p>
                        <p className="text-[10px] font-medium text-slate-400">{c.code} · Unavailable</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-extrabold text-slate-500 bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      Not Supported
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedOtpCountry(c.id)}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-xs ring-2 ring-primary/20"
                      : "border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-6 rounded border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs shrink-0">
                      <img src={c.flag} alt={c.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{c.name}</p>
                        {c.isPremium && (
                          <span className="text-[8px] font-black bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 px-1 py-0.2 rounded uppercase">
                            PREMIUM
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">{c.code} · {c.stock}</p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-slate-900 dark:text-white">₦{exactPrice.toLocaleString()}</span>
                </div>
              );
            })}
          </div>

          {/* Action trigger */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            {smsError && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{smsError}</span>
              </div>
            )}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Order: <strong className="text-slate-900 dark:text-white">{activeCountryObj.name} ({activeCountryObj.code})</strong> for <strong className="text-slate-900 dark:text-white">{activeServiceObj.name}</strong> · Rate: <strong className="text-primary dark:text-indigo-400">₦{activeOrderRate.toLocaleString()}</strong>
              </div>
              <Button
                disabled={isGeneratingNumber}
                onClick={() => {
                  if ((wallet?.balance ?? 0) < activeOrderRate) {
                    setSmsError(`Insufficient balance. Required: ₦${activeOrderRate.toLocaleString()}. Please fund your wallet.`);
                    return;
                  }
                  setSmsError(null);
                  setPinModalAmount(activeOrderRate);
                  setPinModalDesc(`Virtual Number: ${activeServiceObj.name} (${activeCountryObj.name})`);
                  setPendingAction(() => async () => {
                    setIsGeneratingNumber(true);
                    try {
                      const res = await fetch("/api/services/sms/buy", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          userId: user?.id,
                          country: selectedOtpCountry,
                          service: selectedOtpService,
                        }),
                      });
                      const data = await res.json();
                      if (!res.ok) {
                        throw new Error(data.error || "Failed to acquire phone number");
                      }
                      setGeneratedPhone(data.phone || `+${activeCountryObj.code.replace('+', '')} 812 ${Math.floor(100000 + Math.random() * 900000)}`);
                      setSmsOrderId(data.orderId || `SMS_${Date.now()}`);
                      setSystemOrderId(data.systemOrderId || data.orderId || "");
                      setHasGeneratedNumber(true);
                      setSmsReceived(false);
                      setReceivedSmsCode("");
                      setReceivedSmsText("");
                      setSmsTimer(1185);
                    } catch (err: any) {
                      setSmsError(sanitizeClientErrorMessage(err.message));
                    } finally {
                      setIsGeneratingNumber(false);
                    }
                  });
                  setPinModalOpen(true);
                }}
                className="w-full sm:w-auto h-13 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black shadow-lg shadow-primary/25 transition-transform active:scale-95 flex items-center justify-center gap-2"
              >
                {isGeneratingNumber ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Allocating Carrier Line...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    <span>Generate Number (₦{activeOrderRate.toLocaleString()})</span>
                  </>
                )}
              </Button>
            </div>
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
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                    Order ID #{smsOrderId} · Direct carrier routing assigned
                  </p>
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
                  {generatedPhone || "+1 (202) 854-3918"}
                </div>
              </div>
              <Button 
                onClick={() => handleCopy(generatedPhone || "+12028543918", "num")}
                className="h-11 px-6 rounded-xl bg-slate-900 dark:bg-slate-700 text-white hover:bg-primary font-bold text-xs flex items-center gap-2 shadow-sm"
              >
                {copiedNumber ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                {copiedNumber ? "Copied to Clipboard!" : "Copy Number"}
              </Button>
            </div>

            {/* Vendor Client Portal Share Card (No Login Required for Client) */}
            <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-primary/10 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">📲</span>
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-1.5">
                      Share Live Portal with Client
                      <span className="bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                        No Login
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Send this live link to your client so they can see this number & watch their OTP arrive in real-time.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    onClick={() => {
                      const shareId = systemOrderId || smsOrderId;
                      const shareUrl = `${window.location.origin}/verify/${shareId}`;
                      navigator.clipboard.writeText(shareUrl);
                      setCopiedShareLink(true);
                      setTimeout(() => setCopiedShareLink(false), 2500);
                    }}
                    variant="outline"
                    size="sm"
                    className="h-9 px-3.5 rounded-xl border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-1.5 bg-white dark:bg-slate-800"
                  >
                    {copiedShareLink ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedShareLink ? "Link Copied!" : "Copy Client Link"}</span>
                  </Button>
                  <Button
                    onClick={() => {
                      const shareId = systemOrderId || smsOrderId;
                      const shareUrl = `${window.location.origin}/verify/${shareId}`;
                      const msg = `Hello! Here is your ${activeServiceObj.name} verification number:\n📱 Number: ${generatedPhone}\n\n👉 Track your OTP live here (No login needed):\n${shareUrl}\n\nCopy the number, request your code in the app, and it will appear on that link!`;
                      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
                    }}
                    size="sm"
                    className="h-9 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
                  >
                    <span>Send on WhatsApp</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
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
                    <p className="text-3xl font-black text-slate-900 dark:text-white font-mono tracking-widest">{receivedSmsCode || "------"}</p>
                    {receivedSmsText && (
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 max-w-sm truncate">{receivedSmsText}</p>
                    )}
                  </div>
                  <Button 
                    onClick={() => handleCopy(receivedSmsCode.replace(/[^0-9]/g, "") || receivedSmsCode, "code")}
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
                disabled={isCancelingSms}
                onClick={async () => {
                  if (!smsOrderId) {
                    setHasGeneratedNumber(false);
                    setSmsReceived(false);
                    return;
                  }
                  setIsCancelingSms(true);
                  try {
                    const res = await fetch("/api/services/sms/cancel", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ orderId: smsOrderId }),
                    });
                    const data = await res.json();
                    if (data.success) {
                      setHasGeneratedNumber(false);
                      setSmsReceived(false);
                      setSmsOrderId("");
                      setGeneratedPhone("");
                      setReceivedSmsCode("");
                      setReceivedSmsText("");
                      setSmsError(null);
                    } else {
                      setSmsError(data.error || "Failed to cancel order");
                    }
                  } catch (err: any) {
                    setSmsError(err.message || "Failed to cancel order");
                  } finally {
                    setIsCancelingSms(false);
                  }
                }}
                variant="ghost" 
                className="text-xs font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl"
              >
                {isCancelingSms ? "Canceling & Refunding..." : "Cancel & Refund Wallet"}
              </Button>
            </div>
          </div>
        )}

        {/* Security Transaction PIN Modal */}
        <TransactionPinModal
          isOpen={pinModalOpen}
          onClose={() => {
            setPinModalOpen(false);
            setPendingAction(null);
          }}
          onSuccess={async () => {
            if (pendingAction) {
              await pendingAction();
            }
          }}
          amountNGN={pinModalAmount}
          description={pinModalDesc}
          userId={user?.id}
        />
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. RICH SMM BOOST SERVICES FLOW (Paxplug Reference)
  // -------------------------------------------------------------
  if (slug.includes("boost")) {
    const activeService = smmServices.find(s => s.id === selectedSmmServiceId) || smmServices[0];
    const activeRate = dynamicPricing[activeService.id] || activeService.rate;
    const totalPrice = ((parseInt(smmQuantity) || 0) / 1000) * activeRate;

    const isPostTarget = ["likes", "views", "comments", "shares", "saves", "retweets"].includes(activeService.category);
    const targetLabel = isPostTarget
      ? `${activeService.platform === "tiktok" ? "TikTok" : activeService.platform === "instagram" ? "Instagram" : activeService.platform === "youtube" ? "YouTube" : activeService.platform === "twitter" ? "Twitter / X" : "Target"} Post / Video URL`
      : `${activeService.platform === "tiktok" ? "TikTok" : activeService.platform === "instagram" ? "Instagram" : activeService.platform === "youtube" ? "YouTube" : activeService.platform === "telegram" ? "Telegram" : "Target"} Profile Link / Channel URL`;

    const targetPlaceholder = isPostTarget
      ? activeService.platform === "tiktok"
        ? "https://vt.tiktok.com/... or https://www.tiktok.com/@user/video/..."
        : activeService.platform === "instagram"
        ? "https://www.instagram.com/p/... or /reel/..."
        : activeService.platform === "youtube"
        ? "https://www.youtube.com/watch?v=..."
        : activeService.platform === "twitter"
        ? "https://x.com/username/status/..."
        : "https://..."
      : activeService.platform === "tiktok"
      ? "https://www.tiktok.com/@your_username"
      : activeService.platform === "instagram"
      ? "https://instagram.com/your_handle"
      : activeService.platform === "twitter"
      ? "https://x.com/your_handle"
      : activeService.platform === "telegram"
      ? "https://t.me/your_channel"
      : "https://...";

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
            <span className="flex items-center gap-1 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60 px-2 py-0.5 rounded-md">🔵 HIGH</span>
            <span className="flex items-center gap-1 bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 px-2 py-0.5 rounded-md">🟣 FARM</span>
            <span className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 px-2 py-0.5 rounded-md">🟠 PROVIDER</span>
          </div>
        </div>

        {/* Step 1: Platform Selection Cards */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">1</span>
              Select Platform
            </label>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{smmPlatforms.length} Networks Available</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 gap-2.5">
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
                    <span className="text-base font-black text-slate-900 dark:text-white">₦{(dynamicPricing[srv.id] || srv.rate).toLocaleString()}</span>
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
                {targetLabel}
              </label>
              <Input 
                value={smmLink}
                onChange={(e) => setSmmLink(e.target.value)}
                placeholder={targetPlaceholder}
                className="h-13 rounded-2xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-semibold text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                {isPostTarget 
                  ? "Ensure the specific post/video is public and not age-restricted." 
                  : "Ensure the profile or channel is set to public, not private."}
              </p>
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

          {/* SMM Delivery Queue Notice */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200 space-y-1.5">
            <div className="flex items-center gap-2 font-bold">
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Automated Delivery & Start Window:</span>
            </div>
            <p className="pl-6 text-[11px] leading-relaxed text-amber-900/80 dark:text-amber-200/90 font-medium">
              Orders enter the network worker queue automatically. <strong>Start time is typically 15 to 60 minutes</strong> (speed: {activeService.speed}). Likes & views will gradually register on your {activeService.platform} link as the worker pool processes the request.
            </p>
          </div>

          {/* Checkout Breakdown */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Wallet Balance</span>
              <p className="text-sm font-black text-slate-900 dark:text-white">₦{formattedBalance}</p>
            </div>
            <div className="text-right space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Charge</span>
              <p className="text-xl font-black text-primary dark:text-indigo-400">₦{Math.round(totalPrice).toLocaleString()}</p>
            </div>
          </div>

          {smmError && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{smmError}</span>
            </div>
          )}

          {smmSuccess ? (
            <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 space-y-3">
              <div className="flex items-center gap-2.5 font-bold text-sm sm:text-base">
                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Order Placed! Order ID #{smmPlacedOrder?.orderId || smmPlacedOrder?.systemOrderId || "SMM-74912"} is active & processing.</span>
              </div>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 pl-7 leading-relaxed font-medium">
                Your boost has been scheduled. Engagements normally start delivering to your link within <strong>15–60 minutes</strong>. You can monitor live fulfillment on your Order History page.
              </p>
              <div className="pl-7 pt-1 flex flex-wrap items-center gap-3">
                <Link href="/dashboard/orders">
                  <Button size="sm" className="h-9 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white">
                    View in Order History <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Button>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setSmmSuccess(false);
                    setSmmLink("");
                  }}
                  className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  Boost Another Link
                </button>
              </div>
            </div>
          ) : (
            <Button 
              disabled={isSubmittingSmm}
              onClick={() => {
                if (!smmLink.trim()) {
                  setSmmError("Please enter your target profile or post URL.");
                  return;
                }
                const qty = parseInt(smmQuantity);
                if (isNaN(qty) || qty < 50) {
                  setSmmError("Minimum order quantity is 50.");
                  return;
                }
                if ((wallet?.balance ?? 0) < totalPrice) {
                  setSmmError(`Insufficient wallet balance. Required: ₦${Math.round(totalPrice).toLocaleString()}. Please fund your wallet.`);
                  return;
                }
                setSmmError(null);
                setPinModalAmount(Math.round(totalPrice));
                setPinModalDesc(`SMM Boost: ${activeService.name} (${qty.toLocaleString()} units)`);
                setPendingAction(() => async () => {
                  setIsSubmittingSmm(true);
                  try {
                    const res = await fetch("/api/services/smm/order", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        userId: user?.id,
                        serviceId: activeService.id,
                        link: smmLink.trim(),
                        quantity: qty,
                      }),
                    });
                    const data = await res.json();
                    if (!res.ok) {
                      throw new Error(data.error || "Failed to place SMM boost order");
                    }
                    setSmmPlacedOrder(data);
                    setSmmSuccess(true);
                  } catch (err: any) {
                    setSmmError(sanitizeClientErrorMessage(err.message));
                  } finally {
                    setIsSubmittingSmm(false);
                  }
                });
                setPinModalOpen(true);
              }}
              className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-base shadow-lg shadow-primary/25 transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              {isSubmittingSmm ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Submitting Boost Order...</span>
                </>
              ) : (
                <span>Submit Boost Order (₦{Math.round(totalPrice).toLocaleString()})</span>
              )}
            </Button>
          )}
        </div>

        {/* Security Transaction PIN Modal */}
        <TransactionPinModal
          isOpen={pinModalOpen}
          onClose={() => {
            setPinModalOpen(false);
            setPendingAction(null);
          }}
          onSuccess={async () => {
            if (pendingAction) {
              await pendingAction();
            }
          }}
          amountNGN={pinModalAmount}
          description={pinModalDesc}
          userId={user?.id}
        />
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
          <div className="hidden sm:flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/20 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-black uppercase">
            <Clock className="h-3.5 w-3.5" />
            <span>Coming Soon</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-7 shadow-sm space-y-6">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center gap-2.5">
            <Clock className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>Data bundle automated delivery is currently being upgraded and will launch soon. In the meantime, use our live Virtual Numbers, SMM Boosts, and Social Logs!</span>
          </div>

          <div className="space-y-2.5 opacity-60 pointer-events-none">
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

          <div className="space-y-2 opacity-60 pointer-events-none">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Recipient Phone Number</label>
            <Input 
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="e.g. 0812 345 6789" 
              className="h-13 rounded-2xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-bold text-base text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          <div className="space-y-3 opacity-60 pointer-events-none">
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
            disabled
            className="w-full h-14 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-black text-base cursor-not-allowed"
          >
            Coming Soon
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
        <div className="flex items-center justify-between">
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
          <div className="hidden sm:flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/20 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-black uppercase">
            <Clock className="h-3.5 w-3.5" />
            <span>Coming Soon</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-7 shadow-sm space-y-6">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center gap-2.5">
            <Clock className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>Airtime top-up automated delivery is currently being upgraded and will launch soon. In the meantime, use our live Virtual Numbers, SMM Boosts, and Social Logs!</span>
          </div>

          <div className="space-y-2.5 opacity-60 pointer-events-none">
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

          <div className="space-y-2 opacity-60 pointer-events-none">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Phone Number</label>
            <Input 
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="08012345678" 
              className="h-13 rounded-2xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-bold text-base text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          <div className="space-y-2.5 opacity-60 pointer-events-none">
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
            disabled
            className="w-full h-14 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-black text-base cursor-not-allowed"
          >
            Coming Soon
          </Button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 5. AFFILIATE WEBSITE LEAD GEN FLOW (Primex Reference)
  // -------------------------------------------------------------
  if (slug.includes("affiliate")) {
    const handleAffiliateOrder = () => {
      const fullSite = `www.${domainName.trim() || "mybrand"}${selectedDomain}`;
      const price = selectedDomain === ".com" ? "₦400,000" : selectedDomain === ".ng" ? "₦360,000" : "₦320,000";
      const message = `Hello TSLA Engineering,\n\nI want to order an Affiliate Website:\n🌐 Domain: ${fullSite}\n📦 Package: ${selectedDomain} (${price})\n📱 Contact Phone: ${whatsappNumber.trim() || "Not specified"}\n\nPlease confirm setup details and payment instructions.`;
      const mailUrl = `mailto:support@tslainvst.com?subject=${encodeURIComponent("Affiliate Website Order: " + fullSite)}&body=${encodeURIComponent(message)}`;
      window.location.href = mailUrl;
      setAffiliateSubmitted(true);
    };

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
              <span>Wallet: ₦{formattedBalance}</span>
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
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-center space-y-2">
                <p className="font-black text-sm">🎉 Inquiry Prepared!</p>
                <p className="text-xs">Your inquiry has been routed to our engineering desk at support@tslainvst.com.</p>
                <Button 
                  onClick={handleAffiliateOrder}
                  variant="outline" 
                  size="sm" 
                  className="text-xs font-bold border-emerald-300"
                >
                  Resend Inquiry
                </Button>
              </div>
            ) : (
              <Button 
                onClick={handleAffiliateOrder}
                className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-base shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
              >
                <Mail className="h-5 w-5" />
                Submit Order Inquiry to Engineering
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
