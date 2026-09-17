/**
 * Payvessel Payment Gateway Provider Client
 * Handles generation of dedicated Nigerian Virtual Bank Accounts (9PSB / Wema Bank)
 * and verifies incoming automated deposit webhooks.
 */

interface VirtualAccountResponse {
  status?: boolean;
  success?: boolean;
  message?: string;
  banks?: Array<{
    bankCode: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
  }> | {
    bankCode: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
}

export class PayvesselService {
  private static apiKey = process.env.PAYVESSEL_API_KEY || "";
  private static secretKey = process.env.PAYVESSEL_SECRET_KEY || "";
  private static businessId = process.env.PAYVESSEL_BUSINESS_ID || "";

  private static getBaseUrl(): string {
    // Automatically switch between Sandbox and Production based on API key prefix
    if (this.apiKey.startsWith("PVTEST")) {
      return "https://sandbox.payvessel.com";
    }
    return "https://api.payvessel.com";
  }

  /**
   * Generates a dedicated personal bank account for a user
   * @param name - Full name of customer
   * @param email - Customer email
   * @param phoneNumber - Customer phone number
   */
  static async createVirtualAccount(
    name: string,
    email: string,
    phoneNumber: string = "08012345678"
  ): Promise<{ bankName: string; accountNumber: string; accountName: string }> {
    if (!this.apiKey || !this.secretKey || !this.businessId) {
      // Fallback preview while waiting for credentials
      return {
        bankName: "Pending Verification",
        accountNumber: "••••••••••",
        accountName: `TSLA - ${name}`,
      };
    }

    const baseUrl = this.getBaseUrl();
    const endpoint = `${baseUrl}/pms/api/external/request/customerReservedAccount/`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "api-key": this.apiKey,
        "api-secret": this.secretKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        name,
        phoneNumber,
        bankcode: ["120001"], // 9PSB / Wema
        account_type: "STATIC",
        businessid: this.businessId,
      }),
    });

    const data = (await response.json()) as VirtualAccountResponse;

    if (!response.ok || (data.status === false && data.success === false)) {
      throw new Error(data.message || `Payvessel Error (${response.status})`);
    }

    // Handle both array and single object bank structures
    if (Array.isArray(data.banks) && data.banks.length > 0) {
      const primaryBank = data.banks[0];
      return {
        bankName: primaryBank.bankName || "9Payment Service Bank",
        accountNumber: primaryBank.accountNumber,
        accountName: primaryBank.accountName || `TSLA - ${name}`,
      };
    } else if (data.banks && typeof data.banks === "object" && "accountNumber" in data.banks) {
      return {
        bankName: data.banks.bankName || "9Payment Service Bank",
        accountNumber: data.banks.accountNumber,
        accountName: data.banks.accountName || `TSLA - ${name}`,
      };
    }

    throw new Error(data.message || "Failed to parse bank details from Payvessel");
  }

  /**
   * Verify HMAC-SHA512 signature of incoming Payvessel webhook
   * Payvessel passes the hash in `HTTP_PAYVESSEL_HTTP_SIGNATURE` or `payvessel-http-signature`
   */
  static verifyWebhookSignature(payload: string, signatureHeader?: string | null): boolean {
    if (!this.secretKey) {
      console.warn("⚠️ Payvessel secretKey not configured, webhook verification skipped in dev mode.");
      return process.env.NODE_ENV === "development";
    }

    if (!signatureHeader) {
      return false;
    }

    try {
      const crypto = require("crypto");
      const computedHash = crypto
        .createHmac("sha512", this.secretKey)
        .update(payload)
        .digest("hex")
        .toLowerCase();

      const receivedHash = signatureHeader.trim().toLowerCase();

      // Secure constant-time string comparison
      if (computedHash.length !== receivedHash.length) {
        return false;
      }

      return crypto.timingSafeEqual(
        Buffer.from(computedHash, "utf8"),
        Buffer.from(receivedHash, "utf8")
      );
    } catch (err) {
      console.error("Error during Payvessel signature verification:", err);
      return false;
    }
  }
}

