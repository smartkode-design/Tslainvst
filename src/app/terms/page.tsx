"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldAlert, Scale, Lock, ShieldCheck, AlertTriangle, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080c14] text-slate-900 dark:text-slate-100 selection:bg-primary/20 transition-colors duration-200">
      {/* Top Sticky Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-30 px-4 py-3.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.back()}
              className="h-10 w-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="font-extrabold text-slate-900 dark:text-white text-base leading-tight">Terms of Service</h1>
              <p className="text-[11px] font-semibold text-slate-400">Legal Agreement & Acceptable Use Policy</p>
            </div>
          </div>
          <Link href="/dashboard">
            <Button size="sm" variant="outline" className="rounded-xl text-xs font-bold border-slate-200 dark:border-slate-700">
              Dashboard
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-8 pb-28">
        {/* Title & Introduction */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary dark:text-indigo-400 text-xs font-black uppercase tracking-wider">
            <Scale className="h-3.5 w-3.5" />
            <span>TSLA Terms of Service & User Agreement</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Terms & Conditions of Use
          </h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
            Last Updated: September 2026. Please read these Terms and Conditions carefully before creating an account or using any services provided by TSLA Technologies ("TSLA", "we", "us", or "our").
          </p>
        </div>

        {/* CRITICAL CALLOUT: ZERO TOLERANCE FOR ILLEGAL ACTIVITY & LAW ENFORCEMENT DISCLOSURE */}
        <div className="p-6 sm:p-7 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-500/40 text-rose-950 dark:text-rose-200 space-y-4 shadow-lg shadow-rose-500/5">
          <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
            <div className="h-10 w-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-600/20">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-black text-lg text-rose-700 dark:text-rose-300 tracking-tight">
                CRITICAL NOTICE: ZERO TOLERANCE FOR ILLEGAL USE & LAW ENFORCEMENT DISCLOSURE
              </h3>
              <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
                Mandatory Legal Disclaimer for All Users
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm font-semibold text-rose-900 dark:text-rose-200 leading-relaxed">
            <p>
              <strong>1. Absolute Prohibition of Illegal Activities:</strong> TSLA strictly prohibits the use of any of our services—including but not limited to virtual phone numbers, temporary carrier lines, SMS OTP verification codes, aged social media accounts/logs, SMM engagement services, and automated APIs—for any fraudulent, criminal, scam, phishing, harassment, identity theft, unauthorized system access, financial fraud, terrorism, or illegal activity under Nigerian law, international treaties, or applicable foreign jurisdictions.
            </p>
            <p>
              <strong>2. Mandatory Customer Information Disclosure to Law Enforcement:</strong> If any customer or account is reported, suspected, or detected using TSLA services for any illegal or fraudulent purpose, or <strong>if TSLA is officially requested, subpoenaed, or ordered by law enforcement agencies, cybercrime divisions, national security operatives, regulatory bodies, or a court of competent jurisdiction to reveal customer information, TSLA WILL FULLY COOPERATE AND HAND OVER ALL RELEVANT CUSTOMER DATA.</strong>
            </p>
            <p>
              This disclosure will include, without limitation: full registered name, verified email address, phone number, registration timestamps, complete IP address history, device headers, payment records, bank account proofs, transaction histories, and specific service usage records.
            </p>
            <p className="font-black text-rose-700 dark:text-rose-300">
              By registering an account, depositing funds, or utilizing any TSLA service, you irrevocably agree to this disclosure and waive any right of confidentiality regarding unlawful or fraudulent activities.
            </p>
          </div>
        </div>

        {/* Section 1: Acceptance of Terms */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <h3 className="font-black text-base text-slate-900 dark:text-white">1. Acceptance of Terms & Eligibility</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            By accessing TSLA, creating an account, or purchasing any digital service, you confirm that you are at least 18 years of age (or have reached legal majority in your jurisdiction), possess the legal capacity to enter into binding agreements, and agree to be bound by these Terms of Service. If you do not agree to any part of these Terms, you must discontinue platform use immediately.
          </p>
        </div>

        {/* Section 2: Wallet Deposits & No External Transfer-Outs Policy */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5">
            <Lock className="h-5 w-5 text-primary" />
            <h3 className="font-black text-base text-slate-900 dark:text-white">2. Wallet Funding & No External Transfer-Outs Policy</h3>
          </div>
          <div className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <p>
              <strong>In-Platform Store Credit Only:</strong> Funds deposited into your TSLA wallet via Paystack (card, bank transfer, USSD) or authorized admin funding are converted directly into in-platform store credit exclusively intended for purchasing digital products, virtual carrier numbers, social accounts, and tech services offered on TSLA.
            </p>
            <p>
              <strong>No External Cash Withdrawals or Outward Transfers:</strong> TSLA is a digital marketplace and service provider, not a banking institution, deposit-taking bank, or money remittance service. <strong>Wallet balances CANNOT be transferred out to personal bank accounts, transferred to external wallets, or withdrawn as cash.</strong> There are NO outward fund transfers. All deposit payments are final and non-refundable once credited.
            </p>
            <p>
              Users must ensure they only deposit amounts they intend to spend on active services or digital assets available on the platform.
            </p>
          </div>
        </div>

        {/* Section 3: Virtual Phone Numbers & SMS Verifications */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h3 className="font-black text-base text-slate-900 dark:text-white">3. Virtual Phone Numbers & OTP Verifications</h3>
          </div>
          <div className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <p>
              <strong>Dynamic Carrier Allocation:</strong> Virtual phone numbers provided by TSLA are temporary, single-use carrier lines allocated through licensed global carrier routes solely for legitimate account verification and SMS OTP reception.
            </p>
            <p>
              <strong>Delivery Guarantee & In-Platform Refund:</strong> You are only charged for numbers that successfully receive an SMS verification code. If an allocated number does not receive an SMS within the session countdown (typically 20 minutes), the reservation can be cancelled and 100% of the charge is automatically refunded to your TSLA platform wallet balance.
            </p>
            <p>
              <strong>Single-Session Nature:</strong> Virtual numbers are temporary and cannot be reused or recalled once the session expires or is closed. TSLA is not responsible if a third-party application requests subsequent re-verification at a later date.
            </p>
          </div>
        </div>

        {/* Section 4: Social Accounts, Marketplace Logs & Warranty */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5">
            <FileText className="h-5 w-5 text-primary" />
            <h3 className="font-black text-base text-slate-900 dark:text-white">4. Social Media Logs & Marketplace Warranty</h3>
          </div>
          <div className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <p>
              <strong>Automated Credential Delivery:</strong> Digital accounts, logs, and tokens purchased on the TSLA Marketplace are delivered instantly upon entering your 4-digit Transaction PIN.
            </p>
            <p>
              <strong>24-Hour Replacement Guarantee:</strong> TSLA provides a strict 24-hour warranty for invalid credentials (such as incorrect password, invalid 2FA secret, or disabled account at the exact moment of delivery). To claim a replacement or store credit, you must contact support within 24 hours of purchase with unedited evidence.
            </p>
            <p>
              <strong>User Environmental Responsibility:</strong> Buyers are strictly responsible for using clean proxies, anti-detect browsers, and following platform guidelines when logging into aged accounts. TSLA bears no responsibility for account bans, checkpoints, or lockouts caused by dirty IP addresses, blacklisted devices, aggressive botting, or improper user handling post-delivery.
            </p>
          </div>
        </div>

        {/* Section 5: Account Security & 4-Digit PIN */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5">
            <Lock className="h-5 w-5 text-primary" />
            <h3 className="font-black text-base text-slate-900 dark:text-white">5. Account Security & Transaction PIN Responsibility</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            You are exclusively responsible for maintaining the confidentiality of your account password and the 4-digit Transaction PIN you set during registration. Any transaction or order executed with your valid 4-digit PIN is irrevocably deemed to have been authorized by you. If you suspect unauthorized access to your account, you must contact TSLA Support immediately.
          </p>
        </div>

        {/* Section 6: Limitation of Liability */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h3 className="font-black text-base text-slate-900 dark:text-white">6. Limitation of Liability</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            To the maximum extent permitted by applicable law, TSLA, its officers, employees, and suppliers shall not be liable for any indirect, incidental, punitive, special, or consequential damages resulting from the use or inability to use our services, unauthorized account access, carrier network delays, or third-party platform policy updates. In all cases, TSLA's total liability is strictly limited to the amount paid for the specific service in dispute.
          </p>
        </div>

        {/* Section 7: Legal Inquiries & Contact */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-3">
          <h3 className="font-black text-base text-slate-900 dark:text-white">7. Official Contact & Regulatory Inquiries</h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            For official law enforcement inquiries, legal notices, or account questions, please reach our compliance desk:
          </p>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-mono space-y-1">
            <p><strong>Entity:</strong> TSLA Technologies Compliance Desk</p>
            <p><strong>Official Support Desk WhatsApp:</strong> +234 811 449 1126</p>
            <p><strong>Compliance & Legal Email:</strong> legal@tslainvst.com</p>
            <p><strong>Website:</strong> https://www.tslainvst.com</p>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Link href="/privacy" className="text-xs font-bold text-primary dark:text-indigo-400 hover:underline">
            Read our Privacy Policy &rarr;
          </Link>
          <Button onClick={() => router.back()} className="w-full sm:w-auto h-11 px-6 rounded-xl font-black text-xs">
            Back to Application
          </Button>
        </div>
      </div>
    </div>
  );
}
