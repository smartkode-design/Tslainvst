/**
 * Dynamic Pricing Engine & Mapping Store
 * Supports real-time price overrides configured by the Admin.
 */

export interface PricingItem {
  id: string;
  name: string;
  category: "sms" | "country" | "smm";
  icon?: string;
  code?: string;
  wholesaleUSD: number;
  wholesaleEstNGN: number; // estimated using ~₦1,600 / $1
  retailNGN: number;
  active: boolean;
  unitLabel?: string; // e.g. "per number", "per 1,000 followers"
}

export const DEFAULT_PRICING: PricingItem[] = [
  // --- Virtual Numbers Target Services ---
  {
    id: "sms_whatsapp",
    name: "WhatsApp",
    category: "sms",
    icon: "🟢",
    wholesaleUSD: 0.20,
    wholesaleEstNGN: 320,
    retailNGN: 1400,
    active: true,
    unitLabel: "per number",
  },
  {
    id: "sms_telegram",
    name: "Telegram",
    category: "sms",
    icon: "✈️",
    wholesaleUSD: 0.15,
    wholesaleEstNGN: 240,
    retailNGN: 2250,
    active: true,
    unitLabel: "per number",
  },
  {
    id: "sms_googlevoice",
    name: "Google Voice",
    category: "sms",
    icon: "📞",
    wholesaleUSD: 0.55,
    wholesaleEstNGN: 880,
    retailNGN: 3500,
    active: true,
    unitLabel: "per number",
  },
  {
    id: "sms_signal",
    name: "Signal Messenger",
    category: "sms",
    icon: "💬",
    wholesaleUSD: 0.20,
    wholesaleEstNGN: 320,
    retailNGN: 900,
    active: true,
    unitLabel: "per number",
  },
  {
    id: "sms_openai",
    name: "OpenAI / ChatGPT",
    category: "sms",
    icon: "🤖",
    wholesaleUSD: 0.25,
    wholesaleEstNGN: 400,
    retailNGN: 1350,
    active: true,
    unitLabel: "per number",
  },
  {
    id: "sms_google",
    name: "Google / Gmail",
    category: "sms",
    icon: "🔴",
    wholesaleUSD: 0.25,
    wholesaleEstNGN: 400,
    retailNGN: 900,
    active: true,
    unitLabel: "per number",
  },
  {
    id: "sms_tinder",
    name: "Tinder",
    category: "sms",
    icon: "🔥",
    wholesaleUSD: 0.30,
    wholesaleEstNGN: 480,
    retailNGN: 1200,
    active: true,
    unitLabel: "per number",
  },
  {
    id: "sms_tiktok",
    name: "TikTok",
    category: "sms",
    icon: "🎵",
    wholesaleUSD: 0.20,
    wholesaleEstNGN: 320,
    retailNGN: 800,
    active: true,
    unitLabel: "per number",
  },
  {
    id: "sms_facebook",
    name: "Facebook",
    category: "sms",
    icon: "📘",
    wholesaleUSD: 0.20,
    wholesaleEstNGN: 320,
    retailNGN: 850,
    active: true,
    unitLabel: "per number",
  },
  {
    id: "sms_twitter",
    name: "Twitter / X",
    category: "sms",
    icon: "🐦",
    wholesaleUSD: 0.20,
    wholesaleEstNGN: 320,
    retailNGN: 850,
    active: true,
    unitLabel: "per number",
  },
  {
    id: "sms_claude",
    name: "Claude AI (Anthropic)",
    category: "sms",
    icon: "🔮",
    wholesaleUSD: 0.35,
    wholesaleEstNGN: 560,
    retailNGN: 1350,
    active: true,
    unitLabel: "per number",
  },
  {
    id: "sms_discord",
    name: "Discord",
    category: "sms",
    icon: "🎮",
    wholesaleUSD: 0.20,
    wholesaleEstNGN: 320,
    retailNGN: 850,
    active: true,
    unitLabel: "per number",
  },
  {
    id: "sms_apple",
    name: "Apple ID / iCloud",
    category: "sms",
    icon: "🍏",
    wholesaleUSD: 0.45,
    wholesaleEstNGN: 720,
    retailNGN: 1400,
    active: true,
    unitLabel: "per number",
  },
  {
    id: "sms_netflix",
    name: "Netflix",
    category: "sms",
    icon: "🍿",
    wholesaleUSD: 0.25,
    wholesaleEstNGN: 400,
    retailNGN: 950,
    active: true,
    unitLabel: "per number",
  },
  {
    id: "sms_paypal",
    name: "PayPal",
    category: "sms",
    icon: "💳",
    wholesaleUSD: 0.50,
    wholesaleEstNGN: 800,
    retailNGN: 1600,
    active: true,
    unitLabel: "per number",
  },
  {
    id: "sms_steam",
    name: "Steam",
    category: "sms",
    icon: "🎯",
    wholesaleUSD: 0.25,
    wholesaleEstNGN: 400,
    retailNGN: 900,
    active: true,
    unitLabel: "per number",
  },
  {
    id: "sms_amazon",
    name: "Amazon",
    category: "sms",
    icon: "📦",
    wholesaleUSD: 0.35,
    wholesaleEstNGN: 560,
    retailNGN: 1100,
    active: true,
    unitLabel: "per number",
  },
  {
    id: "sms_uber",
    name: "Uber",
    category: "sms",
    icon: "🚗",
    wholesaleUSD: 0.20,
    wholesaleEstNGN: 320,
    retailNGN: 850,
    active: true,
    unitLabel: "per number",
  },
  {
    id: "sms_microsoft",
    name: "Microsoft / Outlook",
    category: "sms",
    icon: "💻",
    wholesaleUSD: 0.25,
    wholesaleEstNGN: 400,
    retailNGN: 900,
    active: true,
    unitLabel: "per number",
  },
  {
    id: "sms_snapchat",
    name: "Snapchat",
    category: "sms",
    icon: "👻",
    wholesaleUSD: 0.20,
    wholesaleEstNGN: 320,
    retailNGN: 800,
    active: true,
    unitLabel: "per number",
  },
  {
    id: "sms_binance",
    name: "Binance",
    category: "sms",
    icon: "🪙",
    wholesaleUSD: 0.45,
    wholesaleEstNGN: 720,
    retailNGN: 1500,
    active: true,
    unitLabel: "per number",
  },
  {
    id: "sms_spotify",
    name: "Spotify",
    category: "sms",
    icon: "🎧",
    wholesaleUSD: 0.15,
    wholesaleEstNGN: 240,
    retailNGN: 750,
    active: true,
    unitLabel: "per number",
  },
  {
    id: "sms_linkedin",
    name: "LinkedIn",
    category: "sms",
    icon: "💼",
    wholesaleUSD: 0.40,
    wholesaleEstNGN: 640,
    retailNGN: 1300,
    active: true,
    unitLabel: "per number",
  },

  // --- Virtual Numbers Country Routing ---
  {
    id: "country_us",
    name: "United States (+1)",
    category: "country",
    code: "+1",
    wholesaleUSD: 0.55,
    wholesaleEstNGN: 880,
    retailNGN: 1900,
    active: true,
    unitLabel: "base rate",
  },
  {
    id: "country_gb",
    name: "United Kingdom (+44)",
    category: "country",
    code: "+44",
    wholesaleUSD: 0.60,
    wholesaleEstNGN: 960,
    retailNGN: 2150,
    active: true,
    unitLabel: "base rate",
  },
  {
    id: "country_ng",
    name: "Nigeria (+234)",
    category: "country",
    code: "+234",
    wholesaleUSD: 0.25,
    wholesaleEstNGN: 400,
    retailNGN: 850,
    active: true,
    unitLabel: "base rate",
  },
  {
    id: "country_ca",
    name: "Canada (+1)",
    category: "country",
    code: "+1",
    wholesaleUSD: 0.55,
    wholesaleEstNGN: 880,
    retailNGN: 1350,
    active: true,
    unitLabel: "base rate",
  },
  {
    id: "country_gh",
    name: "Ghana (+233)",
    category: "country",
    code: "+233",
    wholesaleUSD: 0.35,
    wholesaleEstNGN: 560,
    retailNGN: 950,
    active: true,
    unitLabel: "base rate",
  },
  {
    id: "country_za",
    name: "South Africa (+27)",
    category: "country",
    code: "+27",
    wholesaleUSD: 0.40,
    wholesaleEstNGN: 640,
    retailNGN: 1100,
    active: true,
    unitLabel: "base rate",
  },
  {
    id: "country_ke",
    name: "Kenya (+254)",
    category: "country",
    code: "+254",
    wholesaleUSD: 0.30,
    wholesaleEstNGN: 480,
    retailNGN: 900,
    active: true,
    unitLabel: "base rate",
  },
  {
    id: "country_de",
    name: "Germany (+49)",
    category: "country",
    code: "+49",
    wholesaleUSD: 0.65,
    wholesaleEstNGN: 1040,
    retailNGN: 1600,
    active: true,
    unitLabel: "base rate",
  },
  {
    id: "country_fr",
    name: "France (+33)",
    category: "country",
    code: "+33",
    wholesaleUSD: 0.60,
    wholesaleEstNGN: 960,
    retailNGN: 1550,
    active: true,
    unitLabel: "base rate",
  },
  {
    id: "country_nl",
    name: "Netherlands (+31)",
    category: "country",
    code: "+31",
    wholesaleUSD: 0.55,
    wholesaleEstNGN: 880,
    retailNGN: 1450,
    active: true,
    unitLabel: "base rate",
  },
  {
    id: "country_br",
    name: "Brazil (+55)",
    category: "country",
    code: "+55",
    wholesaleUSD: 0.35,
    wholesaleEstNGN: 560,
    retailNGN: 950,
    active: true,
    unitLabel: "base rate",
  },
  {
    id: "country_in",
    name: "India (+91)",
    category: "country",
    code: "+91",
    wholesaleUSD: 0.25,
    wholesaleEstNGN: 400,
    retailNGN: 800,
    active: true,
    unitLabel: "base rate",
  },
  {
    id: "country_au",
    name: "Australia (+61)",
    category: "country",
    code: "+61",
    wholesaleUSD: 0.70,
    wholesaleEstNGN: 1120,
    retailNGN: 1750,
    active: true,
    unitLabel: "base rate",
  },

  // --- SMM Boosting Services (High Margin Commercial Catalog) ---
  {
    id: "ig-fol-fast",
    name: "Instagram Followers [Super Fast 50k/Day | 90D Refill]",
    category: "smm",
    icon: "📸",
    wholesaleUSD: 0.25,
    wholesaleEstNGN: 400,
    retailNGN: 3850,
    active: true,
    unitLabel: "per 1,000",
  },
  {
    id: "ig-fol-nigerian",
    name: "Instagram Real Nigerian Followers [100% Organic Active]",
    category: "smm",
    icon: "🇳🇬",
    wholesaleUSD: 0.75,
    wholesaleEstNGN: 1200,
    retailNGN: 6800,
    active: true,
    unitLabel: "per 1,000",
  },
  {
    id: "ig-fol-guaranteed",
    name: "Instagram Followers [Non-Drop | 365 Days Lifetime Guarantee]",
    category: "smm",
    icon: "🛡️",
    wholesaleUSD: 1.80,
    wholesaleEstNGN: 2880,
    retailNGN: 14500,
    active: true,
    unitLabel: "per 1,000",
  },
  {
    id: "ig-lik-hq",
    name: "Instagram HQ Likes [Instant 0-5m | Non-Drop]",
    category: "smm",
    icon: "❤️",
    wholesaleUSD: 0.08,
    wholesaleEstNGN: 128,
    retailNGN: 550,
    active: true,
    unitLabel: "per 1,000",
  },
  {
    id: "ig-viw-reels",
    name: "Instagram Reel & Video Views [Algorithm FYP Booster]",
    category: "smm",
    icon: "🔥",
    wholesaleUSD: 0.03,
    wholesaleEstNGN: 48,
    retailNGN: 350,
    active: true,
    unitLabel: "per 1,000",
  },
  {
    id: "ig-com-custom",
    name: "Instagram Custom Comments [Targeted Active Profiles]",
    category: "smm",
    icon: "💬",
    wholesaleUSD: 0.75,
    wholesaleEstNGN: 1200,
    retailNGN: 5800,
    active: true,
    unitLabel: "per 1,000",
  },
  {
    id: "tt-fol-instant",
    name: "TikTok Followers [Instant Start | 30D Refill | Real]",
    category: "smm",
    icon: "🎵",
    wholesaleUSD: 0.25,
    wholesaleEstNGN: 400,
    retailNGN: 4200,
    active: true,
    unitLabel: "per 1,000",
  },
  {
    id: "tt-fol-nigerian",
    name: "TikTok Nigerian / African Followers [Real Organic]",
    category: "smm",
    icon: "🇳🇬",
    wholesaleUSD: 0.80,
    wholesaleEstNGN: 1280,
    retailNGN: 7200,
    active: true,
    unitLabel: "per 1,000",
  },
  {
    id: "tt-lik-real",
    name: "TikTok Video Likes [Real Profile Engagements]",
    category: "smm",
    icon: "❤️",
    wholesaleUSD: 0.12,
    wholesaleEstNGN: 192,
    retailNGN: 950,
    active: true,
    unitLabel: "per 1,000",
  },
  {
    id: "tt-viw-viral",
    name: "TikTok Viral FYP Video Views [Algorithm Pusher]",
    category: "smm",
    icon: "🚀",
    wholesaleUSD: 0.02,
    wholesaleEstNGN: 32,
    retailNGN: 320,
    active: true,
    unitLabel: "per 1,000",
  },
  {
    id: "tw-fol-hq",
    name: "Twitter / X Followers [Real Profiles | 30D Refill]",
    category: "smm",
    icon: "🐦",
    wholesaleUSD: 0.60,
    wholesaleEstNGN: 960,
    retailNGN: 7500,
    active: true,
    unitLabel: "per 1,000",
  },
  {
    id: "tw-lik-hq",
    name: "Twitter / X Likes & Favorites [Instant Non-Drop]",
    category: "smm",
    icon: "❤️",
    wholesaleUSD: 0.20,
    wholesaleEstNGN: 320,
    retailNGN: 1900,
    active: true,
    unitLabel: "per 1,000",
  },
  {
    id: "tw-rt-reposts",
    name: "Twitter / X Retweets & Reposts [Trending Push]",
    category: "smm",
    icon: "🔁",
    wholesaleUSD: 0.25,
    wholesaleEstNGN: 400,
    retailNGN: 2500,
    active: true,
    unitLabel: "per 1,000",
  },
  {
    id: "tg-mem-lifetime",
    name: "Telegram Channel / Group Members [Zero Drop Lifetime]",
    category: "smm",
    icon: "✈️",
    wholesaleUSD: 0.40,
    wholesaleEstNGN: 640,
    retailNGN: 3900,
    active: true,
    unitLabel: "per 1,000",
  },
  {
    id: "tg-mem-nigerian",
    name: "Telegram Nigerian Targeted Members [Crypto & Forex]",
    category: "smm",
    icon: "🇳🇬",
    wholesaleUSD: 0.90,
    wholesaleEstNGN: 1440,
    retailNGN: 6800,
    active: true,
    unitLabel: "per 1,000",
  },
  {
    id: "tg-viw-posts",
    name: "Telegram Post Views [Instant Multi-Post]",
    category: "smm",
    icon: "👁️",
    wholesaleUSD: 0.03,
    wholesaleEstNGN: 48,
    retailNGN: 350,
    active: true,
    unitLabel: "per 1,000",
  },
  {
    id: "yt-sub-safe",
    name: "YouTube Subscribers [Non-Drop | Monetization Safe]",
    category: "smm",
    icon: "▶️",
    wholesaleUSD: 1.80,
    wholesaleEstNGN: 2880,
    retailNGN: 9800,
    active: true,
    unitLabel: "per 1,000",
  },
  {
    id: "yt-viw-retention",
    name: "YouTube High Retention Views [3-5 Mins Watch Time]",
    category: "smm",
    icon: "⏱️",
    wholesaleUSD: 0.60,
    wholesaleEstNGN: 960,
    retailNGN: 3400,
    active: true,
    unitLabel: "per 1,000",
  },
  {
    id: "fb-fol-page",
    name: "Facebook Page Likes & Followers [60D Refill]",
    category: "smm",
    icon: "📘",
    wholesaleUSD: 0.65,
    wholesaleEstNGN: 1040,
    retailNGN: 4500,
    active: true,
    unitLabel: "per 1,000",
  },
  {
    id: "fb-lik-reactions",
    name: "Facebook Post Likes & Reactions [Instant]",
    category: "smm",
    icon: "👍",
    wholesaleUSD: 0.20,
    wholesaleEstNGN: 320,
    retailNGN: 1500,
    active: true,
    unitLabel: "per 1,000",
  },
  {
    id: "sp-str-royalty",
    name: "Spotify Premium Track Streams [USA/EU Royalty Eligible]",
    category: "smm",
    icon: "🎧",
    wholesaleUSD: 0.55,
    wholesaleEstNGN: 880,
    retailNGN: 3400,
    active: true,
    unitLabel: "per 1,000",
  },
  {
    id: "sp-fol-artist",
    name: "Spotify Artist Profile Followers [Non-Drop]",
    category: "smm",
    icon: "🎵",
    wholesaleUSD: 0.45,
    wholesaleEstNGN: 720,
    retailNGN: 3100,
    active: true,
    unitLabel: "per 1,000",
  },
  {
    id: "audiomack-song-streams",
    name: "Audiomack Song Plays / Streams [Nigerian Chart Booster]",
    category: "smm",
    icon: "🔊",
    wholesaleUSD: 0.25,
    wholesaleEstNGN: 400,
    retailNGN: 1950,
    active: true,
    unitLabel: "per 1,000",
  },
  {
    id: "audiomack-artist-followers",
    name: "Audiomack Artist Profile Followers & Re-ups",
    category: "smm",
    icon: "🎶",
    wholesaleUSD: 0.40,
    wholesaleEstNGN: 640,
    retailNGN: 2800,
    active: true,
    unitLabel: "per 1,000",
  },
  {
    id: "snapchat-followers-public",
    name: "Snapchat Public Profile Followers [30D Refill]",
    category: "smm",
    icon: "👻",
    wholesaleUSD: 0.85,
    wholesaleEstNGN: 1360,
    retailNGN: 4800,
    active: true,
    unitLabel: "per 1,000",
  },
  {
    id: "snapchat-story-views",
    name: "Snapchat Spotlight & Story Views [Viral Booster]",
    category: "smm",
    icon: "👀",
    wholesaleUSD: 0.12,
    wholesaleEstNGN: 192,
    retailNGN: 950,
    active: true,
    unitLabel: "per 1,000",
  },
  {
    id: "threads-followers-instant",
    name: "Meta Threads Followers [Instant Non-Drop]",
    category: "smm",
    icon: "🧵",
    wholesaleUSD: 0.55,
    wholesaleEstNGN: 880,
    retailNGN: 3800,
    active: true,
    unitLabel: "per 1,000",
  },
  {
    id: "discord-members-online",
    name: "Discord Server Members [Online Active Status]",
    category: "smm",
    icon: "🎮",
    wholesaleUSD: 0.70,
    wholesaleEstNGN: 1120,
    retailNGN: 4200,
    active: true,
    unitLabel: "per 1,000",
  },
  {
    id: "discord-members-offline",
    name: "Discord Server Members [Offline Non-Drop Booster]",
    category: "smm",
    icon: "👾",
    wholesaleUSD: 0.30,
    wholesaleEstNGN: 480,
    retailNGN: 2600,
    active: true,
    unitLabel: "per 1,000",
  },
  {
    id: "linkedin-company-followers",
    name: "LinkedIn Company Page & Professional Followers",
    category: "smm",
    icon: "💼",
    wholesaleUSD: 1.60,
    wholesaleEstNGN: 2560,
    retailNGN: 8500,
    active: true,
    unitLabel: "per 1,000",
  },
  {
    id: "twitch-channel-followers",
    name: "Twitch Channel Followers [Affiliate Safe]",
    category: "smm",
    icon: "🟣",
    wholesaleUSD: 0.50,
    wholesaleEstNGN: 800,
    retailNGN: 3200,
    active: true,
    unitLabel: "per 1,000",
  },
  {
    id: "kick-channel-followers",
    name: "Kick.com Channel Followers [Instant Start Non-Drop]",
    category: "smm",
    icon: "🟢",
    wholesaleUSD: 0.65,
    wholesaleEstNGN: 1040,
    retailNGN: 3600,
    active: true,
    unitLabel: "per 1,000",
  },
  {
    id: "pinterest-followers",
    name: "Pinterest Board & Profile Followers",
    category: "smm",
    icon: "📌",
    wholesaleUSD: 0.50,
    wholesaleEstNGN: 800,
    retailNGN: 3400,
    active: true,
    unitLabel: "per 1,000",
  },
];

/**
 * Check if a service is available in a given country
 */
export function isServiceSupportedInCountry(serviceId: string, countryId: string): boolean {
  const s = serviceId.toLowerCase();
  const c = countryId.toLowerCase();

  // Google Voice is strictly available only for USA, UK, and Canada numbers
  if (s === "googlevoice") {
    return ["us", "gb", "ca"].includes(c);
  }

  // All other 23 services are supported across all global routes
  return true;
}

/**
 * Authoritative matrix calculator for SMS OTP pricing
 * Ensures US, UK, Australia are premium priced and country cards match checkout 100%
 */
export function calculateSmsPrice(
  serviceId: string, 
  countryId: string, 
  dynamicOverrides: Record<string, number> = {}
): number {
  const s = serviceId.toLowerCase();
  const c = countryId.toLowerCase();

  // 1. Check custom overrides from admin if present
  const exactKey = `sms_${s}_${c}`;
  if (dynamicOverrides[exactKey]) {
    return dynamicOverrides[exactKey];
  }

  // 2. Specific Matrix Table for Requested Services
  if (s === "googlevoice") {
    // US, UK, and Canada Google Voice
    return 3500;
  }

  if (s === "whatsapp") {
    if (c === "us") return 2500;
    if (c === "gb") return 2700;
    if (c === "au") return 2800;
    if (c === "ca") return 2400;
    if (["de", "fr", "nl", "es", "pl", "se", "tr"].includes(c)) return 2300;
    if (["ng", "gh", "ke", "za", "in", "id", "ph", "my", "vn", "br"].includes(c)) return 1400;
    return 1800;
  }

  if (s === "telegram") {
    if (c === "us") return 2250; // Market competitive rate (beating ₦2,300 competitor price)
    if (c === "gb") return 4500;
    if (c === "au") return 4300;
    if (c === "ca") return 3900;
    if (["de", "fr", "nl", "es", "pl", "se", "tr"].includes(c)) return 3800;
    return 2250;
  }

  if (s === "signal") {
    if (c === "us" || c === "gb" || c === "au") return 1200;
    if (c === "ca" || ["de", "fr", "nl", "es", "pl", "se", "tr"].includes(c)) return 1100;
    if (["ng", "gh", "ke", "za", "in", "id", "ph", "my", "vn", "br"].includes(c)) return 900;
    return 1000;
  }

  if (s === "openai" || s === "claude") {
    if (c === "us") return 2400;
    if (c === "gb") return 2500;
    if (c === "au") return 2500;
    if (c === "ca") return 2200;
    if (["de", "fr", "nl"].includes(c)) return 2000;
    if (["ng", "gh", "ke", "in", "id"].includes(c)) return 1350;
    return 1600;
  }

  if (s === "google") {
    if (c === "us") return 2200;
    if (c === "gb") return 2300;
    if (c === "au") return 2300;
    return 1200;
  }

  if (s === "apple") {
    if (c === "us") return 2800;
    if (c === "gb") return 2900;
    if (c === "au") return 2900;
    return 1900;
  }

  if (s === "paypal") {
    if (c === "us") return 2900;
    if (c === "gb") return 3100;
    if (c === "au") return 3100;
    return 2200;
  }

  // Tiered fallback for other services
  if (c === "us") return 2200;
  if (c === "gb") return 2400;
  if (c === "au") return 2400;
  if (c === "ca" || ["de", "fr", "nl"].includes(c)) return 1900;
  if (["ng", "gh", "ke", "za", "in", "id", "br"].includes(c)) return 1200;
  return 1500;
}
