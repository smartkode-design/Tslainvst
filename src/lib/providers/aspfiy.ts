import crypto from "crypto";

const ASPFIY_API_URL = "https://api-v1.aspfiy.com";
const WEBHOOK_CALLBACK_URL = process.env.NEXT_PUBLIC_APP_URL 
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/aspfiy` 
  : "https://www.tslainvst.com/api/webhooks/aspfiy";

export interface AspfiyVirtualAccount {
  accountNumber: string;
  accountName: string;
  bankName: string;
  reference: string;
}

export class AspfiyService {
  private static getSecretKey(): string {
    const key = process.env.ASPFIY_SECRET_KEY || "Aspfiy-SEC-KEY-10b584d89d4cc0a180c3216032b43c339e0a18d43723cd46";
    return key.trim();
  }

  /**
   * Verify Aspfiy Webhook signature (MD5 of secret key)
   */
  public static verifyWebhookSignature(signature: string | null): boolean {
    if (!signature) return false;
    const secretKey = this.getSecretKey();
    const expectedSig = crypto
      .createHash("md5")
      .update(secretKey)
      .digest("hex")
      .toLowerCase();
    
    return signature.trim().toLowerCase() === expectedSig;
  }

  /**
   * Reserve a permanent virtual account for a customer (Paga or PalmPay)
   */
  public static async reserveVirtualAccount(params: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }): Promise<AspfiyVirtualAccount> {
    const secretKey = this.getSecretKey();
    const cleanPhone = (params.phone || "09134867896").replace(/[^0-9]/g, "");
    const reference = `TSLA_${params.userId.replace(/-/g, "").slice(0, 10)}_${Date.now().toString().slice(-4)}`;

    const payload = {
      email: params.email.trim().toLowerCase(),
      reference,
      firstName: params.firstName.trim() || "User",
      lastName: params.lastName.trim() || "TSLA",
      webhookUrl: WEBHOOK_CALLBACK_URL,
      phone: cleanPhone.length >= 10 ? cleanPhone : "09134867896",
    };

    // Primary attempt: Paga Reserved Account
    try {
      const res = await fetch(`${ASPFIY_API_URL}/reserve-paga/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.status && data.data?.account) {
        return {
          accountNumber: data.data.account.account_number,
          accountName: data.data.account.account_name || `Aspfiy-TSLA ${params.firstName}`,
          bankName: data.data.account.bank_name || "Paga",
          reference: data.data.reference || reference,
        };
      }

      console.warn("Aspfiy Paga reservation note:", data.message || "Trying PalmPay fallback");
    } catch (err) {
      console.warn("Aspfiy Paga reservation error:", err);
    }

    // Fallback attempt: PalmPay Reserved Account
    try {
      const res = await fetch(`${ASPFIY_API_URL}/reserve-palmpay/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.status && data.data?.account) {
        return {
          accountNumber: data.data.account.account_number,
          accountName: data.data.account.account_name || `Aspfiy-TSLA ${params.firstName}`,
          bankName: data.data.account.bank_name || "PalmPay",
          reference: data.data.reference || reference,
        };
      }

      throw new Error(data.message || "Failed to reserve bank virtual account on Aspfiy");
    } catch (err: any) {
      console.error("Aspfiy reservation error:", err);
      throw new Error(err.message || "Could not generate dedicated bank account right now.");
    }
  }
}
