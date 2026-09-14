"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";
import { ArrowRight, Lock, Mail, User as UserIcon, Phone, ShieldCheck, Zap } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function RegisterPage() {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white dark:bg-[#080c14] text-slate-900 dark:text-slate-100 selection:bg-primary/30 transition-colors duration-200">
      
      {/* LEFT PANE - Marketing / Branding (Hidden on mobile) */}
      <div className="hidden md:flex w-1/2 lg:w-[45%] bg-slate-950 relative flex-col justify-between p-12 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary/20 blur-[120px]" />
          <div className="absolute bottom-[10%] -right-[20%] w-[60%] h-[60%] rounded-full bg-indigo-600/20 blur-[100px]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        </div>

        {/* Top Logo */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 group w-fit">
            <Logo className="h-10 w-10 text-white" />
            <span className="text-3xl font-black tracking-tight text-white">TSLA</span>
          </Link>
        </div>

        {/* Center Copy */}
        <div className="relative z-10 max-w-md mt-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 backdrop-blur-md mb-8">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-slate-300 tracking-wider uppercase">Join Thousands</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight mb-6">
            Start your journey <br/> in minutes.
          </h1>
          <p className="text-lg text-slate-400 font-medium leading-relaxed">
            Create a free account and get instant access to virtual numbers, fast payments, SMM boosting, and a whole lot more.
          </p>
        </div>

        {/* Bottom Feature List */}
        <div className="relative z-10 flex flex-col gap-6 mt-20">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/5 backdrop-blur-sm">
              <Zap className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Instant Setup</h3>
              <p className="text-slate-400 text-sm font-medium mt-1">Get fully verified and ready to trade in under 2 minutes.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/5 backdrop-blur-sm">
              <ShieldCheck className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Secure by Default</h3>
              <p className="text-slate-400 text-sm font-medium mt-1">Your data is encrypted and protected by bank-grade security.</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE - Form */}
      <div className="w-full md:w-1/2 lg:w-[55%] flex flex-col p-6 md:p-12 lg:px-24 justify-center relative overflow-y-auto">
        
        {/* Top bar with theme toggle */}
        <div className="flex items-center justify-between mb-8">
          <div className="md:hidden flex items-center gap-3">
            <Logo className="h-8 w-8 text-primary" />
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">TSLA</span>
          </div>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>

        <div className="max-w-md w-full mx-auto md:mx-0">
          <div className="mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              Create account <span className="text-2xl">🚀</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-bold mt-2">
              Already have one? <Link href="/login" className="text-primary dark:text-indigo-400 hover:underline">Sign in &rarr;</Link>
            </p>
          </div>

          <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
            
            {/* Section: Personal Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-xs font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase">Personal Info</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">First Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <Input 
                      placeholder="John" 
                      className="pl-11 h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:ring-primary/20 focus-visible:border-primary font-medium" 
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Last Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <Input 
                      placeholder="Doe" 
                      className="pl-11 h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:ring-primary/20 focus-visible:border-primary font-medium" 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <Input 
                    type="email" 
                    placeholder="you@example.com" 
                    className="pl-11 h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:ring-primary/20 focus-visible:border-primary font-medium" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <Input 
                    type="tel" 
                    placeholder="08012345678" 
                    className="pl-11 h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:ring-primary/20 focus-visible:border-primary font-medium" 
                  />
                </div>
              </div>
            </div>

            {/* Section: Account Security */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-xs font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase">Account Security</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <Input 
                    type="password" 
                    placeholder="Create a strong password" 
                    className="pl-11 h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:ring-primary/20 focus-visible:border-primary font-medium" 
                  />
                </div>
                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mt-1">Min 6 chars · must include uppercase, lowercase, and a number</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">4-Digit Transaction PIN</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/60" />
                  <Input 
                    type="password" 
                    maxLength={4} 
                    placeholder="Enter 4-digit PIN" 
                    className="pl-11 h-12 rounded-xl bg-primary/5 dark:bg-primary/10 border-primary/20 focus-visible:ring-primary/40 focus-visible:border-primary text-primary dark:text-indigo-400 font-black tracking-[0.5em]" 
                  />
                </div>
                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mt-1">Used to authorise transactions — keep it secret</p>
              </div>
            </div>

            {/* Action */}
            <div className="pt-4">
              <Button className="w-full h-14 text-base rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all active:scale-[0.98] font-bold border-0 flex items-center justify-center gap-2 group" asChild>
                <Link href="/dashboard">
                  Create Account
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <p className="text-xs text-center font-bold text-slate-400 dark:text-slate-500 mt-6">
                By registering, you agree to our <span className="text-slate-900 dark:text-white underline cursor-pointer">Terms of Service</span> and <span className="text-slate-900 dark:text-white underline cursor-pointer">Privacy Policy</span>.
              </p>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
