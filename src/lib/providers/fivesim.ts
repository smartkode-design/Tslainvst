/**
 * 5SIM.net API Provider Client
 * Handles real-time foreign phone numbers, OTP verification, and auto-refunds.
 */

const FIVESIM_BASE_URL = "https://5sim.net/v1";

interface FiveSimProfile {
  id: number;
  email: string;
  balance: number;
  rating: number;
}

interface FiveSimOrder {
  id: number;
  phone: string;
  operator: string;
  product: string;
  price: number;
  status: "PENDING" | "RECEIVED" | "CANCELED" | "TIMEOUT" | "FINISHED" | "BANNED";
  expires: string;
  sms: Array<{
    sender: string;
    text: string;
    code: string;
    created_at: string;
  }>;
  country: string;
  created_at: string;
}

export class FiveSimService {
  private static token = process.env.FIVESIM_API_TOKEN || process.env.FIVESIM_API_KEY || "";

  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!this.token) {
      throw new Error("FIVESIM_API_TOKEN is not configured in environment variables.");
    }

    const response = await fetch(`${FIVESIM_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`5SIM API Error (${response.status}): ${errorText}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Fetch current float balance and account details
   */
  static async getProfile(): Promise<FiveSimProfile> {
    if (!this.token) {
      return { id: 0, email: "demo@tsla.agency", balance: 15.5, rating: 100 };
    }
    return this.request<FiveSimProfile>("/user/profile");
  }

  /**
   * Buy an activation number for a specific service and country
   * @param country - e.g. "usa", "southafrica", "kenya", "indonesia"
   * @param operator - e.g. "any", "virtual28", "virtual63"
   * @param service - e.g. "whatsapp", "telegram", "openai", "google"
   */
  /**
   * Fetch 5SIM real-time prices for country and product, sorted by wholesale cost ascending
   */
  static async getCheapestOperators(
    country: string,
    service: string
  ): Promise<Array<{ operator: string; cost: number; count: number }>> {
    const countryMap: Record<string, string> = {
      us: "usa",
      gb: "england",
      uk: "england",
      ng: "nigeria",
      ca: "canada",
      gh: "ghana",
      za: "southafrica",
      ke: "kenya",
      de: "germany",
      fr: "france",
      nl: "netherlands",
      br: "brazil",
      in: "india",
      au: "australia",
      id: "indonesia",
      ph: "philippines",
      my: "malaysia",
      pl: "poland",
      es: "spain",
      se: "sweden",
      vn: "vietnam",
      tr: "turkey",
    };

    const targetCountry = countryMap[country.toLowerCase()] || country.toLowerCase();
    const targetService = service.toLowerCase() === "googlevoice" ? "googlevoice" : service.toLowerCase();

    try {
      const res = await fetch(`https://5sim.net/v1/guest/prices?country=${targetCountry}&product=${targetService}`);
      if (!res.ok) return [];
      const data = await res.json();
      const countryData = data[targetCountry] || {};
      const serviceData = countryData[targetService] || {};

      return Object.entries(serviceData)
        .filter(([_, info]: [string, any]) => info && typeof info.cost === "number" && info.count > 0)
        .map(([op, info]: [string, any]) => ({ operator: op, cost: Number(info.cost), count: Number(info.count) }))
        .sort((a, b) => a.cost - b.cost);
    } catch (err) {
      console.warn("Failed to query 5sim real-time prices:", err);
      return [];
    }
  }

  /**
   * Buy an activation number for a specific service and country.
   * If operator is 'any', automatically routes to the LOWEST-COST operator with inventory.
   * Protects against overpaying for overpriced high-tier carrier pools.
   */
  static async buyNumber(
    country: string = "usa",
    operator: string = "any",
    service: string = "whatsapp",
    maxWholesaleUSD?: number
  ): Promise<FiveSimOrder> {
    const countryMap: Record<string, string> = {
      us: "usa",
      gb: "england",
      uk: "england",
      ng: "nigeria",
      ca: "canada",
      gh: "ghana",
      za: "southafrica",
      ke: "kenya",
      de: "germany",
      fr: "france",
      nl: "netherlands",
      br: "brazil",
      in: "india",
      au: "australia",
      id: "indonesia",
      ph: "philippines",
      my: "malaysia",
      pl: "poland",
      es: "spain",
      se: "sweden",
      vn: "vietnam",
      tr: "turkey",
    };

    const targetCountry = countryMap[country.toLowerCase()] || country.toLowerCase();
    const targetService = service.toLowerCase() === "googlevoice" ? "googlevoice" : service.toLowerCase();

    if (!this.token) {
      // Demo mock order for preview testing before live token is added
      return {
        id: Math.floor(100000 + Math.random() * 900000),
        phone: targetCountry === "usa" ? `+1 (${Math.floor(200 + Math.random() * 800)}) 555-${Math.floor(1000 + Math.random() * 9000)}` : `+44 7700 ${Math.floor(100000 + Math.random() * 900000)}`,
        operator: "virtual8",
        product: targetService,
        price: 0.85,
        status: "PENDING",
        expires: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        sms: [],
        country: targetCountry,
        created_at: new Date().toISOString(),
      };
    }

    // 1. If operator is "any", automatically select the CHEAPEST operator with stock!
    if (operator.toLowerCase() === "any") {
      const cheapOperators = await this.getCheapestOperators(country, service);

      // Filter out any operator that exceeds max wholesale budget (protect against loss)
      const eligibleOperators = maxWholesaleUSD 
        ? cheapOperators.filter((op) => op.cost <= maxWholesaleUSD) 
        : cheapOperators;

      if (cheapOperators.length > 0 && eligibleOperators.length === 0) {
        throw new Error(
          `Wholesale carrier rates for ${targetCountry.toUpperCase()} ${targetService.toUpperCase()} are currently elevated ($${cheapOperators[0].cost.toFixed(2)}). Order stopped to protect against loss.`
        );
      }

      // Try each eligible operator starting from the lowest cost
      for (const cand of eligibleOperators) {
        try {
          return await this.request<FiveSimOrder>(
            `/user/buy/activation/${targetCountry}/${cand.operator}/${targetService}`
          );
        } catch (err: any) {
          console.warn(`Attempt with low-cost operator ${cand.operator} ($${cand.cost}) failed:`, err.message);
          // Try next cheapest
        }
      }
    }

    // Direct operator request or fallback
    return this.request<FiveSimOrder>(
      `/user/buy/activation/${targetCountry}/${operator.toLowerCase()}/${targetService}`
    );
  }

  /**
   * Poll order status to check for incoming SMS / OTP code
   */
  static async checkOrder(orderId: number | string): Promise<FiveSimOrder> {
    if (!this.token) {
      return {
        id: Number(orderId),
        phone: "+1 555-0199",
        operator: "any",
        product: "whatsapp",
        price: 0.9,
        status: "RECEIVED",
        expires: new Date().toISOString(),
        sms: [
          {
            sender: "WhatsApp",
            text: "Your WhatsApp code is 842-194",
            code: "842194",
            created_at: new Date().toISOString(),
          },
        ],
        country: "usa",
        created_at: new Date().toISOString(),
      };
    }

    return this.request<FiveSimOrder>(`/user/check/${orderId}`);
  }

  /**
   * Cancel order and trigger 100% refund of wholesale cost
   */
  static async cancelOrder(orderId: number | string): Promise<FiveSimOrder> {
    if (!this.token) {
      return {
        id: Number(orderId),
        phone: "",
        operator: "any",
        product: "whatsapp",
        price: 0.9,
        status: "CANCELED",
        expires: new Date().toISOString(),
        sms: [],
        country: "usa",
        created_at: new Date().toISOString(),
      };
    }

    return this.request<FiveSimOrder>(`/user/cancel/${orderId}`);
  }

  /**
   * Ban order on 5SIM if number was blocked/banned by the service (e.g. Telegram)
   */
  static async banOrder(orderId: number | string): Promise<FiveSimOrder> {
    if (!this.token) {
      return {
        id: Number(orderId),
        phone: "",
        operator: "any",
        product: "telegram",
        price: 0.9,
        status: "BANNED",
        expires: new Date().toISOString(),
        sms: [],
        country: "usa",
        created_at: new Date().toISOString(),
      };
    }

    try {
      return await this.request<FiveSimOrder>(`/user/ban/${orderId}`);
    } catch {
      // Fallback to cancel if ban endpoint has any specific provider constraint
      return this.request<FiveSimOrder>(`/user/cancel/${orderId}`);
    }
  }

  /**
   * Mark order as finished once OTP has been used
   */
  static async finishOrder(orderId: number | string): Promise<FiveSimOrder> {
    if (!this.token) {
      return {
        id: Number(orderId),
        phone: "",
        operator: "any",
        product: "whatsapp",
        price: 0.9,
        status: "FINISHED",
        expires: new Date().toISOString(),
        sms: [],
        country: "usa",
        created_at: new Date().toISOString(),
      };
    }

    return this.request<FiveSimOrder>(`/user/finish/${orderId}`);
  }
}
