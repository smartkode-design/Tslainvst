"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Zap, LayoutDashboard, Store, CreditCard, Receipt, Wallet, User, Bell, Search, Settings, HelpCircle, Home, ShoppingBag, LogOut, Shield, Gift } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "@/lib/supabase/client";

// ─── Auth Context so child pages can read user/wallet data ───────────────────
interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  initials: string;
  firstName: string;
}
interface WalletData { balance: number; }
interface AuthContextType { user: UserProfile | null; wallet: WalletData | null; loading: boolean; }

export const AuthContext = createContext<AuthContextType>({ user: null, wallet: null, loading: true });
export const useAuth = () => useContext(AuthContext);

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

// ─── Layout Component ────────────────────────────────────────────────────────
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authCtx, setAuthCtx] = useState<AuthContextType>({ user: null, wallet: null, loading: true });

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;

      if (!session) {
        router.replace("/login");
        return;
      }

      const userId = session.user.id;
      const [{ data: profile }, { data: wallet }] = await Promise.all([
        supabase.from("profiles").select("id, full_name, email, role").eq("id", userId).single(),
        supabase.from("wallets").select("balance").eq("user_id", userId).single(),
      ]);

      if (!mounted) return;

      const fullName = profile?.full_name || session.user.email?.split("@")[0] || "User";
      setAuthCtx({
        user: {
          id: userId,
          full_name: fullName,
          email: profile?.email || session.user.email || "",
          role: profile?.role || "user",
          initials: getInitials(fullName),
          firstName: fullName.split(" ")[0],
        },
        wallet: { balance: Number(wallet?.balance ?? 0) },
        loading: false,
      });

      // Realtime listener to update wallet balance instantly across the entire dashboard
      walletChannel = supabase
        .channel(`layout-wallet-listener-${userId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "wallets",
            filter: `user_id=eq.${userId}`,
          },
          (payload: any) => {
            if (payload.new && typeof payload.new.balance !== "undefined") {
              setAuthCtx((prev) => ({
                ...prev,
                wallet: { balance: Number(payload.new.balance) },
              }));
            }
          }
        )
        .subscribe();
    }

    let walletChannel: any = null;
    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/login");
    });

    return () => { 
      mounted = false; 
      listener.subscription.unsubscribe();
      if (walletChannel) supabase.removeChannel(walletChannel);
    };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Marketplace", href: "/marketplace", icon: Store },
    { name: "Services", href: "/dashboard/services", icon: Zap },
    { name: "Wallet", href: "/dashboard/wallet", icon: Wallet },
    { name: "Refer & Earn", href: "/dashboard/referrals", icon: Gift },
    { name: "Transactions", href: "/dashboard/transactions", icon: CreditCard },
    { name: "Orders", href: "/dashboard/orders", icon: Receipt },
  ];

  const bottomNavItems = [
    { name: "Support", href: "/support", icon: HelpCircle },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const mobileTabs = [
    { name: "Home", href: "/dashboard", icon: Home },
    { name: "Market", href: "/marketplace", icon: ShoppingBag },
    { name: "Wallet", href: "/dashboard/wallet", icon: Wallet },
    { name: "Profile", href: "/settings", icon: User },
  ];

  const { user, loading } = authCtx;

  // Auth loading screen
  if (loading) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-slate-50 dark:bg-[#080c14]">
        <div className="flex flex-col items-center gap-4">
          <Logo className="h-10 w-10 animate-pulse text-primary" />
          <p className="text-xs font-bold text-slate-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={authCtx}>
      <div className="flex h-[100dvh] bg-slate-50 dark:bg-[#080c14] text-slate-900 dark:text-slate-100 overflow-hidden selection:bg-primary/30 transition-colors duration-250">

        {/* Sidebar - Desktop Only */}
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

            {user?.role === "admin" && (
              <div className="pt-3 pb-1">
                <div className="px-4 text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                  <Shield className="h-3 w-3 text-indigo-500" /> Platform Owner
                </div>
                <Link
                  href="/admin"
                  className="flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold bg-gradient-to-r from-slate-900 to-indigo-950 dark:from-slate-900 dark:to-indigo-950/80 text-white border border-indigo-500/40 hover:border-indigo-500 shadow-md shadow-indigo-950/30 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                      <Shield className="h-4 w-4" />
                    </div>
                    <span>Admin Portal</span>
                  </div>
                  <span className="text-[10px] font-black uppercase bg-indigo-500 text-white px-2 py-0.5 rounded-full shadow-xs">
                    Root
                  </span>
                </Link>
              </div>
            )}

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

          {/* Real User Card + Logout */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 z-10 space-y-2">
            <Link href="/settings">
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-xs shrink-0">
                  {user?.initials ?? "?"}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.full_name}</p>
                  <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 truncate flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Active Account
                  </p>
                </div>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 dark:hover:text-rose-400 transition-colors group"
            >
              <LogOut className="h-4 w-4 group-hover:scale-105 transition-transform" />
              Log out
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative">

          {/* Mobile Header */}
          <header className="md:hidden h-16 flex items-center justify-between px-4 z-30 pt-1 border-b border-slate-200/60 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-xs">
                {user?.initials ?? "?"}
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{getGreeting()}</span>
                <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white leading-none">{user?.firstName} 👋</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {user?.role === "admin" && (
                <Link href="/admin">
                  <Button variant="outline" size="sm" className="h-9 px-2.5 rounded-xl border-indigo-500/40 text-indigo-600 dark:text-indigo-400 font-black text-[11px] flex items-center gap-1.5 bg-indigo-50/60 dark:bg-indigo-950/40 shadow-xs">
                    <Shield className="h-3.5 w-3.5 text-indigo-500" />
                    Admin
                  </Button>
                </Link>
              )}
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
              {user?.role === "admin" && (
                <Link href="/admin">
                  <Button className="h-11 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-primary text-white hover:opacity-90 font-black text-xs shadow-md shadow-indigo-500/20 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Admin Portal
                  </Button>
                </Link>
              )}
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

          {/* Mobile Bottom Tab Bar */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 h-18 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 z-40 pb-1 shadow-[0_-4px_25px_rgba(0,0,0,0.04)] flex items-center justify-around px-2">
            {mobileTabs.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link key={tab.name} href={tab.href} className="flex flex-col items-center justify-center w-full h-full gap-1 pt-1">
                  <div className={cn("p-1.5 rounded-xl transition-all duration-200", isActive ? "text-primary bg-primary/10 dark:bg-primary/20" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300")}>
                    <tab.icon className={cn("h-5 w-5", isActive && "fill-primary/20")} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className={cn("text-[10px] font-bold transition-all", isActive ? "text-primary" : "text-slate-400 dark:text-slate-500")}>
                    {tab.name}
                  </span>
                </Link>
              );
            })}
          </nav>

        </div>
      </div>
    </AuthContext.Provider>
  );
}

