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
  private static token = process.env.FIVESIM_API_TOKEN || "";

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
  static async buyNumber(
    country: string = "usa",
    operator: string = "any",
    service: string = "whatsapp"
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
        operator: "any",
        product: targetService,
        price: 0.9,
        status: "PENDING",
        expires: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        sms: [],
        country: targetCountry,
        created_at: new Date().toISOString(),
      };
    }

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
