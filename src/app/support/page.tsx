"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, HelpCircle, Mail, Clock, Send, ShieldCheck, CheckCircle2, MessageSquare
} from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function SupportPage() {
  const router = useRouter();
  const [ticketSent, setTicketSent] = useState(false);
  const [ticketRef, setTicketRef] = useState("");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("Wallet Funding");
  const [message, setMessage] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const faqs = [
    { q: "How long does automated wallet funding take?", a: "Bank transfers to your dedicated Paga virtual account are credited automatically within 10 to 30 seconds." },
    { q: "What happens if I don't receive an SMS on my Virtual Number?", a: "If no SMS is received within the 20-minute session, your wallet is 100% automatically refunded immediately." },
    { q: "How do I report an issue with an SMM boost order?", a: "Submit a support ticket below or email support@tslainvst.com with your Order ID. Our automated system or support team resolves it promptly." },
    { q: "Can I buy a white-label affiliate website?", a: "Yes! Submit an application under Affiliate Site or contact support@tslainvst.com. We build and connect your custom domain to our backend APIs." },
  ];

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    const ref = `TSLA-${Math.floor(100000 + Math.random() * 900000)}`;
    setTicketRef(ref);
    setTicketSent(true);

    // Also trigger mailto in background so user has a copy
    const mailSubject = `[Ticket #${ref}] ${category}: ${subject}`;
    const mailBody = `Hello TSLA Support Team,\n\nTicket Reference: ${ref}\nCategory: ${category}\nContact Email: ${userEmail || "Not specified"}\n\nIssue Description:\n${message}\n\nSent from TSLA Customer Portal.`;
    window.open(`mailto:support@tslainvst.com?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`, "_blank");
  };

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
        {/* Official Support Hero Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-4">
          <div className="space-y-1.5 max-w-xl">
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300 bg-indigo-500/20 border border-indigo-400/30 px-2.5 py-0.5 rounded-full inline-block">
              24/7 Official Helpdesk
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Need Help or Have a Question?</h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Our dedicated engineering and support desk is active 24/7. Submit a support ticket below or email us directly at <strong className="text-white font-mono">support@tslainvst.com</strong>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <a
              href="mailto:support@tslainvst.com?subject=TSLA%20Customer%20Support%20Inquiry"
              className="inline-flex items-center justify-center gap-2 px-6 h-12 rounded-2xl bg-white text-slate-950 font-black text-xs hover:bg-slate-100 shadow-md transition-all active:scale-95"
            >
              <Mail className="h-4 w-4 text-primary" />
              Email support@tslainvst.com
            </a>
            <a
              href="#ticket-form"
              className="inline-flex items-center justify-center gap-2 px-6 h-12 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all"
            >
              <Send className="h-4 w-4 text-indigo-400" />
              Submit Support Ticket
            </a>
          </div>
        </div>

        {/* Contact Channels Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm flex items-center justify-between gap-3.5">
            <div className="flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Official Email</p>
                <p className="text-sm font-black text-slate-900 dark:text-white font-mono">support@tslainvst.com</p>
              </div>
            </div>
            <a
              href="mailto:support@tslainvst.com"
              className="text-xs font-bold text-primary dark:text-indigo-400 hover:underline shrink-0"
            >
              Send Mail
            </a>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Average Response</p>
              <p className="text-sm font-black text-slate-900 dark:text-white">Under 15 Minutes</p>
            </div>
          </div>
        </div>

        {/* Submit Ticket Form */}
        <div id="ticket-form" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-5 scroll-mt-20">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-black text-slate-900 dark:text-white text-base tracking-tight">Submit a Support Ticket</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Please include your order ID or transaction reference for instant resolution.
            </p>
          </div>

          {ticketSent ? (
            <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-black text-base text-emerald-900 dark:text-emerald-200">Ticket Submitted Successfully!</h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mt-1">
                  Ticket Reference: <strong className="font-mono text-slate-950 dark:text-white">{ticketRef}</strong>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  Our team has received your ticket and will follow up via email at <strong className="text-slate-800 dark:text-slate-200">support@tslainvst.com</strong>.
                </p>
              </div>
              <Button
                onClick={() => {
                  setTicketSent(false);
                  setSubject("");
                  setMessage("");
                }}
                variant="outline"
                size="sm"
                className="rounded-xl text-xs font-bold"
              >
                Submit Another Ticket
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Your Email Address</label>
                  <Input 
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="e.g. name@example.com" 
                    className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-semibold text-xs" 
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Issue Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-12 px-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="Wallet Funding">Wallet Funding / Deposit Issue</option>
                    <option value="Virtual Number">Virtual Number (SMS / OTP)</option>
                    <option value="SMM Boost">Social Media Boost Order</option>
                    <option value="Marketplace">Marketplace Product / Order</option>
                    <option value="Transaction PIN">PIN Reset / Security</option>
                    <option value="General Inquiry">General Question / Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Subject</label>
                <Input 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Delayed Wallet Funding / Order #12345" 
                  className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-semibold text-xs" 
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Message & Reference Details</label>
                <textarea 
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe what happened, including any Order ID, reference number, or deposit amount..." 
                  className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs font-medium outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <Button 
                type="submit"
                className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-xs shadow-md flex items-center justify-center gap-2"
              >
                <Send className="h-4 w-4" />
                Submit Support Ticket
              </Button>
            </form>
          )}
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

        {/* Security / Assurance Banner */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-medium pt-2">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>All support communications are encrypted and monitored by TSLA Security.</span>
        </div>
      </div>
    </div>
  );
}
