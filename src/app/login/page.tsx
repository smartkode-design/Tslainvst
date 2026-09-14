"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";
import { ArrowRight, Lock, Mail, ShieldCheck, Zap } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white selection:bg-primary/30">
      
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
            <span className="text-xs font-bold text-slate-300 tracking-wider uppercase">Welcome Back</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight mb-6">
            Log in to your <br/> dashboard.
          </h1>
          <p className="text-lg text-slate-400 font-medium leading-relaxed">
            Access your wallet, track your digital assets, and manage your affiliate platform in one place.
          </p>
        </div>

        {/* Bottom Feature List */}
        <div className="relative z-10 flex flex-col gap-6 mt-20">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/5 backdrop-blur-sm">
              <ShieldCheck className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Secure Login</h3>
              <p className="text-slate-400 text-sm font-medium mt-1">Your session is protected by end-to-end encryption.</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE - Form */}
      <div className="w-full md:w-1/2 lg:w-[55%] flex flex-col p-6 md:p-12 lg:px-24 justify-center relative overflow-y-auto">
        
        {/* Mobile Logo (Only visible on small screens) */}
        <div className="md:hidden flex items-center gap-3 mb-10">
          <Logo className="h-8 w-8 text-primary" />
          <span className="text-2xl font-black tracking-tight text-slate-900">TSLA</span>
        </div>

        <div className="max-w-md w-full mx-auto md:mx-0">
          <div className="mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              Welcome back <span className="text-2xl">👋</span>
            </h2>
            <p className="text-slate-500 font-bold mt-2">
              Don't have an account? <Link href="/register" className="text-primary hover:underline">Create one &rarr;</Link>
            </p>
          </div>

          <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input type="email" placeholder="you@example.com" className="pl-11 h-14 rounded-xl bg-slate-50/50 border-slate-200 focus-visible:ring-primary/20 focus-visible:border-primary font-medium text-base" />
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-700">Password</label>
                  <Link href="/forgot-password" className="text-xs font-bold text-primary hover:underline">Forgot password?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input type="password" placeholder="Enter your password" className="pl-11 h-14 rounded-xl bg-slate-50/50 border-slate-200 focus-visible:ring-primary/20 focus-visible:border-primary font-medium text-base" />
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="pt-4">
              <Button className="w-full h-14 text-base rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all active:scale-[0.98] font-bold border-0 flex items-center justify-center gap-2 group" asChild>
                <Link href="/dashboard">
                  Sign In
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
