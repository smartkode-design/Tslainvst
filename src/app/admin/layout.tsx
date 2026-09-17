"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Zap, 
  LayoutDashboard, 
  Users, 
  Store, 
  Package, 
  ShoppingBag, 
  Wallet, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  CreditCard, 
  AlertTriangle, 
  BarChart, 
  Shield, 
  Settings, 
  FileText, 
  Sliders,
  ArrowLeft,
  ShieldAlert,
  ExternalLink,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  initials: string;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [authStatus, setAuthStatus] = useState<"loading" | "authorized" | "unauthorized">("loading");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    let mounted = true;

    async function checkAdminAccess() {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;

      if (!session) {
        router.replace("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, full_name, email, role")
        .eq("id", session.user.id)
        .single();

      if (!mounted) return;

      const isOwnerOrAdmin = profile?.role === "admin" || session.user.email?.toLowerCase().trim() === "hassanhuss1027@gmail.com";

      if (!isOwnerOrAdmin) {
        setAdminUser({
          id: session.user.id,
          email: profile?.email || session.user.email || "",
          full_name: profile?.full_name || "User",
          role: profile?.role || "user",
          initials: (profile?.full_name || session.user.email || "U").slice(0, 2).toUpperCase(),
        });
        setAuthStatus("unauthorized");
        return;
      }

      const fullName = profile?.full_name || session.user.email?.split("@")[0] || "Admin";
      const initials = fullName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

      setAdminUser({
        id: session.user.id,
        email: profile?.email || session.user.email || "",
        full_name: fullName,
        role: profile?.role || "admin",
        initials: initials || "AD",
      });
      setAuthStatus("authorized");
    }

    checkAdminAccess();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/login");
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [router]);

  const navItems = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Price Mapping", href: "/admin/pricing", icon: Sliders },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Sellers", href: "/admin/sellers", icon: Store },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Categories", href: "/admin/categories", icon: FileText },
    { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
  ];

  const financialItems = [
    { name: "Wallets", href: "/admin/wallets", icon: Wallet },
    { name: "Deposits", href: "/admin/deposits", icon: ArrowDownToLine },
    { name: "Withdrawals", href: "/admin/withdrawals", icon: ArrowUpFromLine },
    { name: "Transactions", href: "/admin/transactions", icon: CreditCard },
  ];
  
  const systemItems = [
    { name: "Disputes", href: "/admin/disputes", icon: AlertTriangle },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart },
    { name: "Audit Logs", href: "/admin/audit", icon: Shield },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const renderNavGroup = (items: any[]) => (
    items.map((item) => {
      const isActive = pathname === item.href || (pathname?.startsWith(`${item.href}/`) && item.href !== "/admin");
      return (
        <Link
          key={item.name}
          href={item.href}
          onClick={() => setMobileNavOpen(false)}
          className={cn(
            "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all",
            isActive 
              ? "bg-slate-900 text-white dark:bg-white dark:text-black shadow-xs" 
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
          )}
        >
          <item.icon className="h-4 w-4 shrink-0" />
          {item.name}
        </Link>
      );
    })
  );

  // 1. Loading State
  if (authStatus === "loading") {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <Logo className="h-10 w-10 animate-pulse text-indigo-400" />
          <p className="text-xs font-bold text-slate-400">Verifying administrator security clearance...</p>
        </div>
      </div>
    );
  }

  // 2. Unauthorized State (Logged in user is NOT an admin)
  if (authStatus === "unauthorized") {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl text-center space-y-6">
          <div className="h-16 w-16 rounded-3xl bg-rose-100 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 flex items-center justify-center mx-auto text-rose-600 dark:text-rose-400">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Administrator Access Required
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              This area is restricted to TSLA platform super administrators. Your account (<strong className="text-slate-700 dark:text-slate-300">{adminUser?.email}</strong>) has role <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px] font-mono font-bold">{adminUser?.role}</span>.
            </p>
          </div>
          <div className="pt-2">
            <Button
              onClick={() => router.replace("/dashboard")}
              className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-md shadow-primary/25 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to Customer Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authorized Super Admin Layout
  return (
    <div className="flex h-screen bg-background overflow-hidden selection:bg-primary/30">
      {/* Mobile Drawer Backdrop */}
      {mobileNavOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-150"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* Mobile Slide-Over Drawer */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border/40 shadow-2xl flex flex-col md:hidden transition-transform duration-250 ease-out",
        mobileNavOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center justify-between px-5 border-b border-border/40 bg-slate-950 dark:bg-black text-white">
          <Link href="/admin" onClick={() => setMobileNavOpen(false)} className="flex items-center gap-2.5">
            <Logo className="h-6 w-6" />
            <span className="text-base font-black tracking-tight">TSLA Admin</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              Root
            </span>
            <button 
              onClick={() => setMobileNavOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto py-5 px-3.5 flex flex-col gap-1">
          {renderNavGroup(navItems)}
          
          <div className="mt-5 mb-1.5 px-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            Financials
          </div>
          {renderNavGroup(financialItems)}
          
          <div className="mt-5 mb-1.5 px-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            System & Security
          </div>
          {renderNavGroup(systemItems)}
        </div>

        <div className="p-3.5 border-t border-border/40 bg-muted/20 space-y-2">
          <Link href="/dashboard" onClick={() => setMobileNavOpen(false)}>
            <button className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-primary/10 hover:text-primary transition-colors">
              <span className="flex items-center gap-2">
                <ArrowLeft className="h-3.5 w-3.5" /> Customer View
              </span>
              <ExternalLink className="h-3.5 w-3.5 opacity-60" />
            </button>
          </Link>

          <div className="flex items-center gap-3 p-2 rounded-xl bg-muted/40 border border-border/30">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-indigo-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
              {adminUser?.initials || "AD"}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold truncate text-foreground">{adminUser?.full_name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{adminUser?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-68 flex-col border-r border-border/40 bg-card z-20">
        <div className="h-16 flex items-center justify-between px-6 border-b border-border/40 bg-slate-950 dark:bg-black text-white">
          <Link href="/admin" className="flex items-center gap-2.5">
            <Logo className="h-6 w-6" />
            <span className="text-base font-black tracking-tight">TSLA Admin</span>
          </Link>
          <span className="text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
            Root
          </span>
        </div>
        
        <div className="flex-1 overflow-auto py-5 px-3.5 flex flex-col gap-1">
          {renderNavGroup(navItems)}
          
          <div className="mt-5 mb-1.5 px-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            Financials
          </div>
          {renderNavGroup(financialItems)}
          
          <div className="mt-5 mb-1.5 px-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            System & Security
          </div>
          {renderNavGroup(systemItems)}
        </div>
        
        {/* Real Admin Profile Card + Switch to Site */}
        <div className="p-3.5 border-t border-border/40 bg-muted/20 space-y-2">
          <Link href="/dashboard">
            <button className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-primary/10 hover:text-primary transition-colors">
              <span className="flex items-center gap-2">
                <ArrowLeft className="h-3.5 w-3.5" /> Customer App
              </span>
              <ExternalLink className="h-3.5 w-3.5 opacity-60" />
            </button>
          </Link>

          <div className="flex items-center gap-3 p-2 rounded-xl bg-muted/40 border border-border/30">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-indigo-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
              {adminUser?.initials || "AD"}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold truncate text-foreground">{adminUser?.full_name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{adminUser?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-border/40 bg-background/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-muted"
              aria-label="Open Admin Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <Logo className="h-5 w-5 md:hidden" />
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-muted-foreground hidden sm:inline">Admin Shield Active</span>
              <span className="text-xs font-bold text-foreground sm:hidden">Admin Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="h-9 text-xs font-bold rounded-xl flex items-center gap-1.5 px-3">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Customer View</span>
                <span className="sm:hidden">App</span>
              </Button>
            </Link>
            <div className="h-8 w-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Shield className="h-4 w-4 text-emerald-500" />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-auto bg-muted/10">
          <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-[1600px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
