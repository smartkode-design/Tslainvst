"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Zap, LayoutDashboard, Store, CreditCard, Receipt, Wallet, User, LogOut, Bell, Search, Settings, HelpCircle, Menu, Home, ShoppingBag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Desktop Sidebar Navigation
  const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Marketplace", href: "/marketplace", icon: Store },
    { name: "Services", href: "/dashboard/services", icon: Zap },
    { name: "Wallet", href: "/dashboard/wallet", icon: Wallet },
    { name: "Transactions", href: "/dashboard/transactions", icon: CreditCard },
    { name: "Orders", href: "/dashboard/orders", icon: Receipt },
  ];

  const bottomNavItems = [
    { name: "Support", href: "/support", icon: HelpCircle },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  // Mobile Native Bottom Tab Bar Navigation
  const mobileTabs = [
    { name: "Home", href: "/dashboard", icon: Home },
    { name: "Market", href: "/marketplace", icon: ShoppingBag },
    { name: "Wallet", href: "/dashboard/wallet", icon: Wallet },
    { name: "Profile", href: "/settings", icon: User },
  ];

  return (
    <div className="flex h-[100dvh] bg-slate-50 dark:bg-[#080c14] text-slate-900 dark:text-slate-100 overflow-hidden selection:bg-primary/30 transition-colors duration-250">
      
      {/* Sidebar - Desktop Only (Crisp Solid Fintech Architecture) */}
      <aside className="hidden md:flex w-72 flex-col border-r border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/95 relative z-20 shadow-xs">
        <div className="h-20 flex items-center px-8 border-b border-slate-100 dark:border-slate-800/80">
          <Link href="/" className="flex items-center gap-3 group">
            <Logo className="h-8 w-8 drop-shadow-xs group-hover:scale-105 transition-transform duration-300" />
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">TSLA</span>
          </Link>
        </div>
        
        <div className="flex-1 overflow-auto py-6 px-4 flex flex-col gap-1.5 z-10">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 group",
                  isActive 
                    ? "bg-primary text-white shadow-md shadow-primary/20" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <item.icon className={cn("h-5 w-5 transition-transform duration-200", isActive ? "scale-105" : "group-hover:scale-105")} />
                {item.name}
              </Link>
            );
          })}

          <div className="mt-8 mb-2 px-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Preferences & Help
          </div>
          
          {bottomNavItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white transition-all duration-200 group"
            >
              <item.icon className="h-5 w-5 group-hover:scale-105 transition-transform duration-200 text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300" />
              {item.name}
            </Link>
          ))}
        </div>
        
        {/* User Card at Bottom of Sidebar */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 z-10">
          <Link href="/settings">
            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-xs">
                OA
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">Oluwaseun A.</p>
                <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 truncate flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Tier-2 Verified
                </p>
              </div>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Mobile Header - Ultra Minimal for Fintech App feel */}
        <header className="md:hidden h-16 flex items-center justify-between px-4 z-30 pt-1 border-b border-slate-200/60 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-xs">
              OA
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Good Evening</span>
              <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white leading-none">Oluwaseun 👋</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <ThemeToggle className="h-9 w-9 rounded-xl" />
            <Link href="/support">
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 relative">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary border-2 border-white dark:border-slate-900"></span>
              </Button>
            </Link>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden md:flex h-20 items-center justify-between px-10 z-10 border-b border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
          <div className="flex-1 flex items-center max-w-xl">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Search products, services, transactions..." 
                className="pl-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus-visible:border-primary focus-visible:ring-primary/20 h-12 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 shadow-2xs transition-all" 
              />
            </div>
          </div>
          <div className="flex items-center gap-3.5">
            <ThemeToggle />
            <Link href="/support">
              <Button variant="outline" className="h-11 px-4 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-xs shadow-2xs flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-slate-400" />
                Support
              </Button>
            </Link>
            <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 relative shadow-2xs">
              <Bell className="h-4 w-4" />
              <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-primary border-2 border-white dark:border-slate-900 animate-pulse"></span>
            </Button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-auto z-10 scroll-smooth pb-24 md:pb-8">
          <div className="container mx-auto p-4 md:p-8 max-w-7xl">
            {children}
          </div>
        </main>

        {/* Mobile Native Bottom Tab Bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-18 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 z-40 pb-1 shadow-[0_-4px_25px_rgba(0,0,0,0.04)] flex items-center justify-around px-2">
          {mobileTabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link 
                key={tab.name} 
                href={tab.href}
                className="flex flex-col items-center justify-center w-full h-full gap-1 pt-1"
              >
                <div className={cn(
                  "p-1.5 rounded-xl transition-all duration-200", 
                  isActive ? "text-primary bg-primary/10 dark:bg-primary/20" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                )}>
                  <tab.icon className={cn("h-5 w-5", isActive && "fill-primary/20")} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={cn(
                  "text-[10px] font-bold transition-all",
                  isActive ? "text-primary" : "text-slate-400 dark:text-slate-500"
                )}>
                  {tab.name}
                </span>
              </Link>
            );
          })}
        </nav>

      </div>
    </div>
  );
}
