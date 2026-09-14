import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Logo } from "@/components/ui/logo";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/60 bg-white/40 backdrop-blur-2xl shadow-sm">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-3 group">
            <Logo className="h-10 w-10 drop-shadow-md group-hover:scale-110 transition-transform duration-300" />
            <span className="text-2xl font-black tracking-tight text-slate-900">TSLA</span>
          </Link>
          
          <nav className="hidden lg:flex items-center gap-8 text-sm font-bold text-slate-500">
            <Link href="/marketplace" className="hover:text-primary transition-colors">Marketplace</Link>
            <Link href="/services" className="hover:text-primary transition-colors">Services</Link>
            <Link href="/gift-cards" className="hover:text-primary transition-colors">Gift Cards</Link>
            <Link href="/esim" className="hover:text-primary transition-colors">eSIM</Link>
            <Link href="/seller" className="hover:text-primary transition-colors">Sell</Link>
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-bold text-slate-700 hover:text-primary transition-colors hidden sm:block">
            Login
          </Link>
          <Button asChild className="rounded-full px-6 bg-slate-900 text-white hover:bg-primary font-bold shadow-lg shadow-slate-900/20 hidden sm:inline-flex border-0 transition-colors">
            <Link href="/dashboard">Get Started</Link>
          </Button>
          <Button variant="ghost" size="icon" className="lg:hidden text-slate-900">
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </header>
  );
}
