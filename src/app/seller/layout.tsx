"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Zap, LayoutDashboard, Package, ShoppingBag, Users, BarChart3, Wallet, Settings, LogOut, Search, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { name: "Overview", href: "/seller", icon: LayoutDashboard },
    { name: "Products", href: "/seller/products", icon: Package },
    { name: "Orders", href: "/seller/orders", icon: ShoppingBag, badge: 12 },
    { name: "Customers", href: "/seller/customers", icon: Users },
    { name: "Analytics", href: "/seller/analytics", icon: BarChart3 },
    { name: "Payouts", href: "/seller/payouts", icon: Wallet },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border/40 bg-card">
        <div className="h-16 flex items-center px-6 border-b border-border/40">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-orange-500 fill-orange-500" />
            <span className="text-xl font-bold tracking-tight">Seller Hub</span>
          </Link>
        </div>
        
        <div className="flex-1 overflow-auto py-6 px-4 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-orange-500 text-white" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </div>
                {item.badge && (
                  <Badge variant={isActive ? "secondary" : "default"} className={isActive ? "bg-white/20 text-white border-0" : "bg-orange-500"}>
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </div>
        
        <div className="p-4 border-t border-border/40">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors mb-2"
          >
            <Settings className="h-5 w-5" />
            Shop Settings
          </Link>
          <div className="flex items-center gap-3 px-3 py-2 mt-4">
            <div className="h-10 w-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-500 font-bold">
              GS
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">GlobalSim</p>
              <p className="text-xs text-success flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-success"></div> Active Store</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-border/40 bg-background/95 backdrop-blur z-10">
          <div className="flex-1 flex items-center max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search orders, products..." 
                className="pl-9 bg-muted/50 border-transparent focus-visible:bg-background h-9 rounded-full" 
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild className="hidden sm:flex border-orange-500/30 text-orange-500 hover:bg-orange-500/10">
              <Link href="/seller/products/new"><Plus className="w-4 h-4 mr-1" /> Add Product</Link>
            </Button>
            <Button variant="ghost" size="icon" className="relative rounded-full">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-orange-500 border-2 border-background"></span>
            </Button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-auto bg-muted/20">
          <div className="container mx-auto p-6 lg:p-8 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// Ensure Plus icon is available in the component above by redefining or importing
import { Plus } from "lucide-react";
