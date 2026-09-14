"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, MessageCircle, HelpCircle, PhoneCall, Mail, 
  ChevronRight, ExternalLink, ShieldCheck, Clock, Send 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function SupportPage() {
  const router = useRouter();
  const [ticketSent, setTicketSent] = useState(false);

  const faqs = [
    { q: "How long does automated wallet funding take?", a: "Bank transfers to your dedicated Palmpay or Paga virtual account are credited automatically within 10 to 30 seconds." },
    { q: "What happens if I don't receive an SMS on my Virtual Number?", a: "If no SMS is received within the 20-minute session, your wallet is 100% automatically refunded immediately." },
    { q: "How do I access my purchased Facebook 2FA or VPN account?", a: "Go to your Orders page and tap 'View Credentials' to instantly copy your email, password, and 2FA secret key." },
    { q: "Can I buy a white-label affiliate website?", a: "Yes! Submit an application under Affiliate Site. We build and connect your custom domain to our backend APIs for ₦150,000." },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080c14] text-slate-900 dark:text-slate-100 selection:bg-primary/20 transition-colors duration-200">
      {/* Top Navbar */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-30 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="h-10 w-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-extrabold text-slate-900 dark:text-white text-base">Customer Support</h1>
          <Link href="/dashboard" className="text-xs font-bold text-primary dark:text-indigo-400">Done</Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6 pb-24">
        {/* Instant WhatsApp Help Banner */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-6 sm:p-8 shadow-lg shadow-emerald-700/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-200">24/7 Dedicated Support</span>
            <h2 className="text-2xl font-black tracking-tight">Need Instant Help?</h2>
            <p className="text-xs text-emerald-100 font-medium max-w-sm">
              Connect directly with our support team on WhatsApp for instant resolution of orders or wallet funding.
            </p>
          </div>
          <a 
            href="https://wa.me/2348000000000" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            <Button className="w-full sm:w-auto h-12 px-6 rounded-2xl bg-white text-emerald-900 hover:bg-emerald-50 font-black text-xs shadow-md flex items-center justify-center gap-2">
              <MessageCircle className="h-4 w-4 text-emerald-600" /> Chat on WhatsApp
            </Button>
          </a>
        </div>

        {/* Contact Channels Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Email Us</p>
              <p className="text-sm font-black text-slate-900 dark:text-white">support@tsla.com</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Average Response</p>
              <p className="text-sm font-black text-slate-900 dark:text-white">Under 5 Minutes</p>
            </div>
          </div>
        </div>

        {/* Frequently Asked Questions */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h3 className="font-black text-slate-900 dark:text-white text-sm tracking-wide flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-primary dark:text-indigo-400" />
            Frequently Asked Questions
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {faqs.map((faq, i) => (
              <div key={i} className="py-3.5 first:pt-1 last:pb-1 space-y-1">
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">{faq.q}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Ticket Form */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h3 className="font-black text-slate-900 dark:text-white text-sm tracking-wide">Submit a Support Ticket</h3>
          <div className="space-y-3">
            <Input 
              placeholder="Subject (e.g. Delayed Wallet Funding)" 
              className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-semibold text-xs" 
            />
            <textarea 
              rows={3}
              placeholder="Describe your issue with order ID or transaction reference..." 
              className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs font-medium outline-none focus:ring-2 focus:ring-primary/20"
            />
            {ticketSent ? (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 text-center">
                Ticket submitted! We will respond to your registered email shortly.
              </div>
            ) : (
              <Button 
                onClick={() => setTicketSent(true)}
                className="w-full h-12 rounded-2xl bg-slate-900 dark:bg-primary text-white hover:bg-primary dark:hover:bg-primary/90 font-bold text-xs"
              >
                Send Ticket
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
