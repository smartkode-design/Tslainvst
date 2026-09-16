"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Sliders
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

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
      const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
      return (
        <Link
          key={item.name}
          href={item.href}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
            isActive 
              ? "bg-slate-900 text-white dark:bg-white dark:text-black" 
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <item.icon className="h-5 w-5" />
          {item.name}
        </Link>
      );
    })
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border/40 bg-card">
        <div className="h-16 flex items-center px-6 border-b border-border/40 bg-slate-950 dark:bg-black text-white">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-white fill-white" />
            <span className="text-xl font-bold tracking-tight">TSLA Admin</span>
          </Link>
        </div>
        
        <div className="flex-1 overflow-auto py-6 px-4 flex flex-col gap-1">
          {renderNavGroup(navItems)}
          
          <div className="mt-6 mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Financials
          </div>
          {renderNavGroup(financialItems)}
          
          <div className="mt-6 mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            System
          </div>
          {renderNavGroup(systemItems)}
        </div>
        
        <div className="p-4 border-t border-border/40 bg-muted/30">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="h-10 w-10 rounded-full bg-slate-900 text-white dark:bg-white dark:text-black flex items-center justify-center font-bold">
              SA
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold truncate">Super Admin</p>
              <p className="text-xs text-muted-foreground truncate">admin@tsla.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-end px-6 border-b border-border/40 bg-background/95 backdrop-blur z-10">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="hidden sm:flex">
              View Site
            </Button>
            <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
              </span>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-auto bg-muted/10">
          <div className="container mx-auto p-6 lg:p-8 max-w-[1600px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
