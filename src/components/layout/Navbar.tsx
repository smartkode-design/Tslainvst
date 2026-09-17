"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, ArrowRight, Store, Zap, Shield, User } from "lucide-react";
import { Logo } from "@/components/ui/logo";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/60 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 backdrop-blur-2xl shadow-xs">
      <div className="container mx-auto px-4 sm:px-6 h-18 sm:h-20 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-3 group">
            <Logo className="h-9 w-9 drop-shadow-xs group-hover:scale-105 transition-transform duration-300" />
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">TSLA</span>
          </Link>
          
          <nav className="hidden lg:flex items-center gap-8 text-sm font-bold text-slate-500 dark:text-slate-400">
            <Link href="/marketplace" className="hover:text-primary dark:hover:text-white transition-colors">Marketplace</Link>
            <Link href="/dashboard/services" className="hover:text-primary dark:hover:text-white transition-colors">Services & Numbers</Link>
            <Link href="/seller" className="hover:text-primary dark:hover:text-white transition-colors">Sell on TSLA</Link>
            <Link href="/support" className="hover:text-primary dark:hover:text-white transition-colors">Support</Link>
          </nav>
        </div>

        <div className="flex items-center gap-3 sm:gap-5">
          <Link href="/login" className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-primary transition-colors hidden sm:block">
            Login
          </Link>
          <Button asChild className="rounded-full px-5 h-10 bg-slate-900 text-white dark:bg-white dark:text-slate-950 hover:bg-primary dark:hover:bg-primary dark:hover:text-white font-bold shadow-md text-xs sm:text-sm border-0 transition-all">
            <Link href="/dashboard">Get Started</Link>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden text-slate-900 dark:text-white h-10 w-10 rounded-xl"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-border/60 bg-background/98 backdrop-blur-2xl px-5 py-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-2">
            <Link
              href="/marketplace"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl font-bold text-sm text-foreground hover:bg-muted"
            >
              <Store className="h-4 w-4 text-primary" />
              Marketplace (Google Voice & Aged Logs)
            </Link>
            <Link
              href="/dashboard/services"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl font-bold text-sm text-foreground hover:bg-muted"
            >
              <Zap className="h-4 w-4 text-emerald-500" />
              Virtual Numbers & SMM Boosting
            </Link>
            <Link
              href="/seller"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl font-bold text-sm text-foreground hover:bg-muted"
            >
              <Shield className="h-4 w-4 text-indigo-500" />
              Merchant & Seller Portal
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl font-bold text-sm text-foreground hover:bg-muted"
            >
              <User className="h-4 w-4 text-muted-foreground" />
              Sign In to Account
            </Link>
          </nav>

          <div className="pt-2 border-t border-border/40">
            <Button asChild className="w-full rounded-xl h-11 font-bold text-sm shadow-md">
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                Launch Customer Portal <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
