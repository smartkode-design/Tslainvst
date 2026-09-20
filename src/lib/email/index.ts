import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.EMAIL_FROM || "TSLA Support <support@tslainvst.com>";

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export interface RefundEmailParams {
  to: string;
  customerName: string;
  orderId: string;
  serviceName: string;
  quantity?: number | string;
  target?: string;
  amountNgn: number;
}

export function generateRefundEmailHtml({
  customerName,
  orderId,
  serviceName,
  quantity,
  target,
  amountNgn,
}: Omit<RefundEmailParams, "to">): string {
  const shortId = orderId ? (orderId.length > 8 ? orderId.slice(0, 8) : orderId) : "N/A";
  const formattedAmount = Number(amountNgn || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>System Refund Credited - TSLA</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0b0f17;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #e2e8f0;
    }
    .container {
      max-width: 580px;
      margin: 30px auto;
      background: #111827;
      border: 1px solid #1f2937;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
    }
    .header {
      background: linear-gradient(135deg, #090d16 0%, #1e1b4b 100%);
      padding: 30px 24px;
      text-align: center;
      border-bottom: 1px solid #1f2937;
    }
    .badge {
      display: inline-block;
      padding: 5px 12px;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #10b981;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      border-radius: 9999px;
      margin-bottom: 10px;
    }
    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .content {
      padding: 28px 24px;
    }
    .greeting {
      font-size: 15px;
      color: #f8fafc;
      margin-bottom: 14px;
    }
    .message {
      font-size: 14px;
      line-height: 1.6;
      color: #94a3b8;
      margin-bottom: 20px;
    }
    .receipt-box {
      background: #0d131f;
      border: 1px solid #1e293b;
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 22px;
    }
    .receipt-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 9px 0;
      border-bottom: 1px solid #1e293b;
      font-size: 13px;
    }
    .receipt-row:last-child {
      border-bottom: none;
      padding-top: 12px;
    }
    .receipt-label {
      color: #64748b;
    }
    .receipt-value {
      color: #f1f5f9;
      font-weight: 600;
      text-align: right;
    }
    .refund-amount {
      color: #10b981;
      font-size: 18px;
      font-weight: 700;
    }
    .btn-container {
      text-align: center;
      margin: 28px 0 12px 0;
    }
    .btn {
      display: inline-block;
      background: #2563eb;
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 28px;
      font-size: 14px;
      font-weight: 600;
      border-radius: 8px;
    }
    .footer {
      background: #090d16;
      padding: 20px 24px;
      text-align: center;
      border-top: 1px solid #1e293b;
      font-size: 12px;
      color: #64748b;
      line-height: 1.5;
    }
    .footer a {
      color: #38bdf8;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">Wallet Credited</div>
      <h1>System Refund Processed</h1>
    </div>

    <div class="content">
      <p class="greeting">Hello <strong>${customerName || "Customer"}</strong>,</p>
      
      <p class="message">
        We noticed that your recent order could not be completed by the server network due to an automated routing issue. 
        As part of our commitment to seamless service, our system has automatically credited a full refund directly to your <strong>TSLA Wallet balance</strong>.
      </p>

      <div class="receipt-box">
        <div class="receipt-row">
          <span class="receipt-label">Service</span>
          <span class="receipt-value">${serviceName}</span>
        </div>
        ${
          quantity
            ? `<div class="receipt-row">
          <span class="receipt-label">Quantity</span>
          <span class="receipt-value">${Number(quantity).toLocaleString()}</span>
        </div>`
            : ""
        }
        <div class="receipt-row">
          <span class="receipt-label">Order Reference</span>
          <span class="receipt-value">#${shortId}</span>
        </div>
        ${
          target
            ? `<div class="receipt-row">
          <span class="receipt-label">Target / Account</span>
          <span class="receipt-value" style="font-size: 12px; max-width: 240px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${target}</span>
        </div>`
            : ""
        }
        <div class="receipt-row">
          <span class="receipt-label">Refund Status</span>
          <span class="receipt-value" style="color: #10b981;">Credited to Wallet</span>
        </div>
        <div class="receipt-row">
          <span class="receipt-label">Amount Credited</span>
          <span class="receipt-value refund-amount">₦${formattedAmount}</span>
        </div>
      </div>

      <p class="message" style="font-size: 13px;">
        Your funds are already available in your wallet. You can use your balance immediately to order any other service, retry with another service package, or hold it safely in your account.
      </p>

      <div class="btn-container">
        <a href="https://tslainvst.com/dashboard" class="btn">Go to My TSLA Dashboard</a>
      </div>
    </div>

    <div class="footer">
      <p>Have questions or need assistance? Our support team is here 24/7.<br>
      Email us at <a href="mailto:support@tslainvst.com">support@tslainvst.com</a></p>
      <p style="margin-top: 10px; font-size: 11px; color: #475569;">
        TSLA Investment & Digital Services &bull; Secure Automated Platform<br>
        This is an automated transaction update for your account.
      </p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Sends a custom-designed System Refund email to a customer via Resend.
 * Strictly limited to refund operations to preserve monthly free email quota.
 */
export async function sendRefundEmail(params: RefundEmailParams) {
  if (!resend) {
    console.warn("[Email Service] Resend is not configured (missing RESEND_API_KEY).");
    return { success: false, error: "Resend API key missing" };
  }

  const shortId = params.orderId ? (params.orderId.length > 8 ? params.orderId.slice(0, 8) : params.orderId) : "N/A";
  const html = generateRefundEmailHtml(params);

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: params.to,
      subject: `System Refund Credited: Order #${shortId} (₦${Number(params.amountNgn || 0).toLocaleString()}) - TSLA`,
      html,
    });

    if (error) {
      console.error("[Email Service] Failed to send refund email:", error);
      return { success: false, error: error.message };
    }

    console.log(`[Email Service] Refund email dispatched successfully to ${params.to} (ID: ${data?.id})`);
    return { success: true, data };
  } catch (err: any) {
    console.error("[Email Service] Unexpected error sending refund email:", err);
    return { success: false, error: err.message };
  }
}
