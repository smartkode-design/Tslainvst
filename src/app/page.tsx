"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { ArrowRight, Zap, Globe, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function AppOnboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Digital life.",
      highlight: "Simplified.",
      description: "One sleek platform for your bills, subscriptions, eSIMs, and digital assets.",
      icon: <Zap className="h-20 w-20 text-indigo-500 mb-6 drop-shadow-lg" />,
      color: "from-indigo-500/20 to-purple-500/0",
    },
    {
      title: "Global Data.",
      highlight: "Zero roaming.",
      description: "Access premium travel eSIMs and stay connected in over 150 countries instantly.",
      icon: <Globe className="h-20 w-20 text-blue-500 mb-6 drop-shadow-lg" />,
      color: "from-blue-500/20 to-cyan-500/0",
    },
    {
      title: "Bank-grade.",
      highlight: "Secure.",
      description: "Your digital assets and transactions are protected by military-grade encryption.",
      icon: <ShieldCheck className="h-20 w-20 text-emerald-500 mb-6 drop-shadow-lg" />,
      color: "from-emerald-500/20 to-teal-500/0",
    }
  ];

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="flex flex-col h-[100dvh] w-full overflow-hidden bg-slate-50 dark:bg-[#080c14] text-slate-900 dark:text-slate-100 relative selection:bg-primary/30 transition-colors duration-200">
      
      {/* Dynamic Background Glow based on current slide */}
      <div 
        className="absolute inset-0 transition-colors duration-1000 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 30%, var(--tw-gradient-from) 0%, transparent 60%)`,
        }}
      >
        <div className={cn("absolute inset-0 opacity-100 transition-opacity duration-1000 bg-gradient-to-b", slides[currentSlide].color)} />
      </div>

      {/* Grid lines background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none -z-10" />

      {/* Header - Minimal Native App Style */}
      <header className="w-full p-6 flex justify-between items-center relative z-20">
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8" />
          <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">TSLA</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/dashboard" className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white transition-colors">
            Skip
          </Link>
        </div>
      </header>

      {/* Main Slider Area */}
      <main className="flex-1 relative flex flex-col items-center justify-center px-6 z-10 w-full max-w-lg mx-auto">
        <div className="relative w-full h-[320px] flex items-center justify-center">
          {slides.map((slide, index) => (
            <div 
              key={index}
              className={cn(
                "absolute inset-0 flex flex-col items-center text-center transition-all duration-700 ease-in-out",
                currentSlide === index 
                  ? "opacity-100 translate-x-0 scale-100 z-10" 
                  : currentSlide < index 
                    ? "opacity-0 translate-x-12 scale-95 -z-10" 
                    : "opacity-0 -translate-x-12 scale-95 -z-10"
              )}
            >
              {slide.icon}
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-3 leading-[1.1] text-slate-900 dark:text-white">
                {slide.title} <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-600">
                  {slide.highlight}
                </span>
              </h1>
              <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 font-bold max-w-sm mx-auto leading-relaxed">
                {slide.description}
              </p>
            </div>
          ))}
        </div>

        {/* Slide Indicators */}
        <div className="flex gap-2 mt-8 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                currentSlide === index ? "w-8 bg-primary" : "w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </main>

      {/* Fixed Bottom CTA Sheet (Native App Style) */}
      <div className="w-full p-6 pb-8 md:pb-10 z-20 relative animate-in slide-in-from-bottom-24 duration-1000 delay-300">
        <div className="max-w-lg mx-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/60 dark:border-slate-800 rounded-[2rem] p-6 shadow-2xl shadow-slate-900/10">
          <div className="mb-4 text-center">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Get Started</h2>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Enter your email to join TSLA</p>
          </div>
          
          <div className="flex flex-col gap-3">
            <input 
              type="email" 
              placeholder="name@example.com" 
              className="w-full h-14 px-5 bg-white/60 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-bold outline-none transition-all"
            />
            <Button className="w-full h-14 text-base rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30 transition-transform active:scale-95 font-bold border-0" asChild>
              <Link href="/register">
                Continue
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
          
          <p className="text-xs text-center font-bold text-slate-400 dark:text-slate-500 mt-5">
            By continuing, you agree to our <span className="text-slate-600 dark:text-slate-300 underline cursor-pointer">Terms</span> and <span className="text-slate-600 dark:text-slate-300 underline cursor-pointer">Privacy Policy</span>.
          </p>
        </div>
      </div>

    </div>
  );
}
