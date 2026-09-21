"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Zap, LayoutDashboard, Package, List, Wallet, Settings, Bell, Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { name: "Overview", href: "/seller", icon: LayoutDashboard },
    { name: "Listings", href: "/seller/listings", icon: Package },
    { name: "Wallet", href: "/dashboard/wallet", icon: Wallet },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 flex-col border-r border-border/40 bg-card">
        <div className="h-16 flex items-center px-5 border-b border-border/40">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-500 fill-orange-500" />
            <span className="text-lg font-black tracking-tight">Seller Hub</span>
          </Link>
        </div>

        <div className="flex-1 overflow-auto py-5 px-3 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/seller" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors",
                  isActive
                    ? "bg-orange-500 text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4.5 w-4.5" />
                {item.name}
              </Link>
            );
          })}

          <div className="mt-4 pt-4 border-t border-border/50">
            <Button asChild size="sm" className="w-full rounded-xl font-bold gap-2 bg-orange-500 hover:bg-orange-600 text-white">
              <Link href="/seller/products/new">
                <Plus className="h-4 w-4" /> New Listing
              </Link>
            </Button>
          </div>
        </div>

        <div className="p-3 border-t border-border/40 space-y-1">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-5 border-b border-border/40 bg-background/95 backdrop-blur z-10">
          <div className="flex items-center gap-3 md:hidden">
            <Link href="/" className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-500 fill-orange-500" />
              <span className="text-base font-black">Seller Hub</span>
            </Link>
          </div>
          <div className="hidden md:block" />
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm" className="hidden sm:flex border-orange-500/30 text-orange-500 hover:bg-orange-500/10 rounded-xl font-bold gap-1.5">
              <Link href="/seller/products/new">
                <Plus className="w-3.5 h-3.5" /> New Listing
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>
        </header>

        {/* Mobile Nav */}
        <div className="md:hidden flex border-b border-border/40 px-3 py-2 gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/seller" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors",
                  isActive
                    ? "bg-orange-500 text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-auto bg-muted/20">
          <div className="container mx-auto p-5 lg:p-8 max-w-5xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
