/**
 * JustAnotherPanel (JAP) SMM API Provider Client
 * Implements the standard SMM API v2 specification.
 */

const JAP_API_URL = process.env.JAP_API_URL || "https://justanotherpanel.com/api/v2";

export interface SmmServiceConfig {
  id: string;
  japServiceId: number;
  category: "Twitter" | "Instagram" | "TikTok" | "Telegram" | "YouTube";
  name: string;
  description: string;
  wholesaleCostUSD: number; // e.g. 0.375 per 1,000
  retailPriceNGN: number;   // e.g. ₦3,500 per 1,000
  minQuantity: number;
  maxQuantity: number;
  speed: string;
  guarantee: string;
}

// Hand-picked curated services catalog with high profit margins
export const CURATED_SMM_CATALOG: SmmServiceConfig[] = [
  {
    id: "twitter-followers-refill",
    japServiceId: 9011, // Hand-picked by user!
    category: "Twitter",
    name: "Twitter / X Followers (7-Day Refill Guaranteed)",
    description: "High quality real profile followers with 7 days refill guarantee.",
    wholesaleCostUSD: 0.375,
    retailPriceNGN: 3500, // ₦2,900 profit per 1k!
    minQuantity: 50,
    maxQuantity: 2500,
    speed: "2,500 / Day",
    guarantee: "7 Days Refill",
  },
  {
    id: "instagram-followers-hq",
    japServiceId: 10452,
    category: "Instagram",
    name: "Instagram High-Quality Followers (Non-Drop)",
    description: "Stable real-looking followers with 30-day refill guarantee.",
    wholesaleCostUSD: 0.85,
    retailPriceNGN: 4500, // ₦3,100 profit per 1k!
    minQuantity: 100,
    maxQuantity: 50000,
    speed: "5,000 / Day",
    guarantee: "30 Days Refill",
  },
  {
    id: "instagram-likes-instant",
    japServiceId: 8120,
    category: "Instagram",
    name: "Instagram Instant High-Speed Likes",
    description: "Instant start likes on any post or reel.",
    wholesaleCostUSD: 0.12,
    retailPriceNGN: 1500, // ₦1,300 profit per 1k!
    minQuantity: 50,
    maxQuantity: 20000,
    speed: "Instant (10k/hr)",
    guarantee: "Lifetime",
  },
  {
    id: "tiktok-views-viral",
    japServiceId: 7421,
    category: "TikTok",
    name: "TikTok Video Views (Algorithm Booster)",
    description: "Fast organic-paced views to push your video onto the FYP.",
    wholesaleCostUSD: 0.02,
    retailPriceNGN: 800, // ₦760 profit per 1k!
    minQuantity: 500,
    maxQuantity: 1000000,
    speed: "100k / Day",
    guarantee: "Guaranteed",
  },
  {
    id: "telegram-members-channel",
    japServiceId: 6205,
    category: "Telegram",
    name: "Telegram Channel / Group Members",
    description: "Non-drop Telegram members for public and private channels.",
    wholesaleCostUSD: 0.80,
    retailPriceNGN: 4000, // ₦2,700 profit per 1k!
    minQuantity: 100,
    maxQuantity: 10000,
    speed: "3,000 / Day",
    guarantee: "30 Days Refill",
  },
];

export class JapService {
  private static apiKey = process.env.JAP_API_KEY || "";

  private static async post<T>(params: Record<string, string | number>): Promise<T> {
    if (!this.apiKey) {
      throw new Error("JAP_API_KEY is not configured in environment variables.");
    }

    const body = new URLSearchParams({
      key: this.apiKey,
      ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
    });

    const response = await fetch(JAP_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`JAP API Error (${response.status}): ${errorText}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Check wholesale float balance on JAP
   */
  static async getBalance(): Promise<{ balance: number; currency: string }> {
    if (!this.apiKey) {
      return { balance: 24.8, currency: "USD" };
    }

    const data = await this.post<{ balance: string; currency: string }>({
      action: "balance",
    });

    return {
      balance: parseFloat(data.balance) || 0,
      currency: data.currency || "USD",
    };
  }

  /**
   * Create an SMM boosting order
   * @param serviceId - The JAP numeric service ID (e.g. 9011)
   * @param link - Social media profile or post URL
   * @param quantity - Number of followers, likes, or views
   */
  static async createOrder(
    serviceId: number,
    link: string,
    quantity: number
  ): Promise<{ order: number }> {
    if (!this.apiKey) {
      return { order: Math.floor(1000000 + Math.random() * 9000000) };
    }

    return this.post<{ order: number }>({
      action: "add",
      service: serviceId,
      link,
      quantity,
    });
  }

  /**
   * Check progress of an order
   */
  static async getOrderStatus(orderId: number | string): Promise<{
    charge: string;
    start_count: string;
    status: "Pending" | "In progress" | "Completed" | "Partial" | "Canceled";
    remains: string;
    currency: string;
  }> {
    if (!this.apiKey) {
      return {
        charge: "0.375",
        start_count: "250",
        status: "In progress",
        remains: "150",
        currency: "USD",
      };
    }

    return this.post({
      action: "status",
      order: orderId,
    });
  }
}
