import crypto from "crypto";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

export interface PaystackInitResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: string; // "success" | "failed" | "abandoned"
    reference: string;
    amount: number; // in kobo
    message: string | null;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    customer: {
      id: number;
      first_name: string | null;
      last_name: string | null;
      email: string;
      phone: string | null;
    };
    metadata?: {
      userId?: string;
      custom_fields?: Array<{
        display_name: string;
        variable_name: string;
        value: string;
      }>;
    };
  };
}

export class PaystackService {
  private static getSecretKey(): string {
    return process.env.PAYSTACK_SECRET_KEY || "";
  }

  /**
   * Initializes an online payment transaction on Paystack
   * @param email - Customer email address
   * @param amountNGN - Amount in Nigerian Naira (NGN)
   * @param userId - TSLA internal user ID
   * @param callbackUrl - URL to redirect the customer after payment completion
   */
  static async initializeTransaction(
    email: string,
    amountNGN: number,
    userId: string,
    callbackUrl?: string
  ): Promise<PaystackInitResponse["data"]> {
    const secretKey = this.getSecretKey();
    if (!secretKey) {
      throw new Error("PAYSTACK_SECRET_KEY is not configured.");
    }

    if (amountNGN < 100) {
      throw new Error("Minimum deposit amount is ₦100.");
    }

    const amountInKobo = Math.round(amountNGN * 100);
    const reference = `TSLA_PSTK_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const payload: Record<string, any> = {
      email,
      amount: amountInKobo,
      currency: "NGN",
      reference,
      channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],
      metadata: {
        userId,
        custom_fields: [
          {
            display_name: "Service",
            variable_name: "service",
            value: "TSLA Wallet Deposit",
          },
          {
            display_name: "User ID",
            variable_name: "user_id",
            value: userId,
          },
        ],
      },
    };

    if (callbackUrl) {
      payload.callback_url = callbackUrl;
    }

    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as PaystackInitResponse;

    if (!response.ok || !data.status) {
      throw new Error(data.message || `Paystack initialization failed (${response.status})`);
    }

    return data.data;
  }

  /**
   * Verify transaction status with Paystack using reference
   * @param reference - Unique transaction reference
   */
  static async verifyTransaction(reference: string): Promise<PaystackVerifyResponse["data"]> {
    const secretKey = this.getSecretKey();
    if (!secretKey) {
      throw new Error("PAYSTACK_SECRET_KEY is not configured.");
    }

    const cleanRef = reference.trim();
    const response = await fetch(
      `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(cleanRef)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    const data = (await response.json()) as PaystackVerifyResponse;

    if (!response.ok || !data.status) {
      throw new Error(data.message || `Paystack verification failed (${response.status})`);
    }

    return data.data;
  }

  /**
   * Cryptographically verifies incoming Paystack webhook HMAC-SHA512 signature
   * @param payload - Raw request body string
   * @param signature - Value of x-paystack-signature header
   */
  static verifyWebhookSignature(payload: string, signature?: string | null): boolean {
    const secretKey = this.getSecretKey();
    if (!secretKey) {
      console.warn("Paystack secretKey is not configured.");
      return false;
    }

    if (!signature) {
      return false;
    }

    try {
      const computedHash = crypto
        .createHmac("sha512", secretKey)
        .update(payload)
        .digest("hex")
        .toLowerCase();

      const receivedHash = signature.trim().toLowerCase();

      if (computedHash.length !== receivedHash.length) {
        return false;
      }

      return crypto.timingSafeEqual(
        Buffer.from(computedHash, "utf8"),
        Buffer.from(receivedHash, "utf8")
      );
    } catch (err) {
      console.error("Error verifying Paystack webhook signature:", err);
      return false;
    }
  }
}
