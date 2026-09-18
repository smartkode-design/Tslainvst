"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Shield, Eye, Lock, ShieldAlert, CheckCircle2, Server, Database } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
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
              <h1 className="font-extrabold text-slate-900 dark:text-white text-base leading-tight">Privacy Policy</h1>
              <p className="text-[11px] font-semibold text-slate-400">Data Protection & Disclosure Standards</p>
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
            <Shield className="h-3.5 w-3.5" />
            <span>TSLA Data Protection & Privacy Policy</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Privacy Policy
          </h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
            Last Updated: September 2026. This Privacy Policy describes how TSLA Technologies ("TSLA", "we", "us") collects, secures, uses, and discloses information when you access our website, applications, APIs, or marketplace services.
          </p>
        </div>

        {/* CRITICAL MANDATORY DISCLOSURE CALLOUT */}
        <div className="p-6 sm:p-7 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-500/40 text-rose-950 dark:text-rose-200 space-y-4 shadow-lg shadow-rose-500/5">
          <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
            <div className="h-10 w-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-600/20">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-black text-lg text-rose-700 dark:text-rose-300 tracking-tight">
                MANDATORY DISCLOSURE: COOPERATION WITH LAW ENFORCEMENT
              </h3>
              <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
                Data Privacy Does Not Protect Illegal or Fraudulent Conduct
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm font-semibold text-rose-900 dark:text-rose-200 leading-relaxed">
            <p>
              TSLA values legitimate user privacy; however, <strong>our privacy protections strictly do NOT apply to users engaged in fraudulent, criminal, or prohibited activities.</strong>
            </p>
            <p>
              We maintain active audit logging on all platform interactions, including registered user names, phone numbers, email addresses, IP address histories, payment traces, and orders.
            </p>
            <p>
              <strong>In the event that any user is suspected, reported, or verified to have utilized TSLA numbers, logs, accounts, or services for illegal or fraudulent schemes, or when served with a lawful request from law enforcement agencies, cybercrime investigation units, security agencies, or regulatory authorities, TSLA WILL FULLY DISCLOSE AND HAND OVER ALL CUSTOMER RECORDS TO THE APPROPRIATE AUTHORITIES WITHOUT DELAY.</strong>
            </p>
          </div>
        </div>

        {/* Section 1: Information We Collect */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <Database className="h-5 w-5 text-primary" />
            <h3 className="font-black text-base text-slate-900 dark:text-white">1. Information We Collect</h3>
          </div>
          <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <div>
              <strong className="text-slate-900 dark:text-white block mb-0.5">A. Account Information:</strong>
              When registering, you provide your first name, last name, valid email address, phone number, password, and a 4-digit Transaction Security PIN.
            </div>
            <div>
              <strong className="text-slate-900 dark:text-white block mb-0.5">B. Financial & Transaction Data:</strong>
              We record transaction logs, payment references, amounts deposited via Paystack, wallet debits, and timestamps. Note: TSLA does not directly store sensitive raw debit card numbers or bank CVVs; card processing is executed directly by PCI-DSS certified payment gateways (Paystack).
            </div>
            <div>
              <strong className="text-slate-900 dark:text-white block mb-0.5">C. Technical, Device & Connection Data:</strong>
              For security, rate-limiting, and fraud prevention, our servers record incoming IP addresses, browser user-agents, device fingerprints, operating systems, and access timestamps.
            </div>
            <div>
              <strong className="text-slate-900 dark:text-white block mb-0.5">D. Service Usage Logs:</strong>
              We log service requests, including virtual numbers provisioned, SMS codes received, social account logs purchased, and SMM boost orders submitted.
            </div>
          </div>
        </div>

        {/* Section 2: How We Use Your Information */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5">
            <Eye className="h-5 w-5 text-primary" />
            <h3 className="font-black text-base text-slate-900 dark:text-white">2. How We Use Your Information</h3>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 list-disc pl-5 leading-relaxed">
            <li>To provision temporary virtual carrier lines and deliver SMS OTP verification codes.</li>
            <li>To deliver credentials for purchased marketplace accounts, social logs, and software tools.</li>
            <li>To credit, debit, and audit your in-platform TSLA wallet balance with 4-digit PIN authentication.</li>
            <li>To detect, prevent, and mitigate unauthorized account access, bot attacks, and fraudulent transactions.</li>
            <li>To provide customer assistance and technical support via WhatsApp (+234 811 449 1126).</li>
            <li>To satisfy legal obligations and assist official law enforcement investigations into cybercrimes.</li>
          </ul>
        </div>

        {/* Section 3: Data Security & Encryption */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5">
            <Lock className="h-5 w-5 text-primary" />
            <h3 className="font-black text-base text-slate-900 dark:text-white">3. Data Security & Storage Standards</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            We implement bank-grade 256-bit SSL/TLS transport layer encryption, secure database row-level security (RLS), and salted cryptographic hashing for passwords and transaction PINs. While we employ rigorous industry best practices to safeguard user data, no digital transmission over the internet can be guaranteed 100% immune from sophisticated breaches. Users are advised to protect their access credentials and never share their PIN.
          </p>
        </div>

        {/* Section 4: Data Retention */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5">
            <Server className="h-5 w-5 text-primary" />
            <h3 className="font-black text-base text-slate-900 dark:text-white">4. Data Retention</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Account data, order records, and transaction histories are retained for as long as your account remains active and for a mandatory statutory period thereafter to comply with financial accounting laws, resolve order disputes, and provide verification evidence to regulatory and law enforcement bodies when requested.
          </p>
        </div>

        {/* Section 5: Contact & Privacy Officer */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-3">
          <h3 className="font-black text-base text-slate-900 dark:text-white">5. Contact & Privacy Inquiries</h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            If you have questions regarding this Privacy Policy, our data practices, or need to submit a legal inquiry, please contact our privacy desk:
          </p>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-mono space-y-1">
            <p><strong>Compliance & Privacy Desk:</strong> TSLA Technologies</p>
            <p><strong>Official Support Desk WhatsApp:</strong> +234 811 449 1126</p>
            <p><strong>Email:</strong> privacy@tslainvst.com / legal@tslainvst.com</p>
            <p><strong>Official Portal:</strong> https://www.tslainvst.com</p>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Link href="/terms" className="text-xs font-bold text-primary dark:text-indigo-400 hover:underline">
            &larr; Read our Terms of Service
          </Link>
          <Button onClick={() => router.back()} className="w-full sm:w-auto h-11 px-6 rounded-xl font-black text-xs">
            Back to Application
          </Button>
        </div>
      </div>
    </div>
  );
}
