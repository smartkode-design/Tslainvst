import Link from "next/link";
import { Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/60 bg-white/40 pt-20 pb-10 relative overflow-hidden backdrop-blur-xl">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow-md">
                <Zap className="h-4 w-4 text-white fill-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900">TSLA</span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              Everything digital. One place. Buy digital products, access everyday services, and trade through a trusted marketplace.
            </p>
          </div>
          
          <div>
            <h4 className="font-black mb-6 text-slate-900">Platform</h4>
            <ul className="space-y-4 text-sm text-slate-500 font-bold">
              <li><Link href="/marketplace" className="hover:text-primary transition-colors">Marketplace</Link></li>
              <li><Link href="/services" className="hover:text-primary transition-colors">Services</Link></li>
              <li><Link href="/seller" className="hover:text-primary transition-colors">Sell with us</Link></li>
              <li><Link href="/wallet" className="hover:text-primary transition-colors">Wallet</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-black mb-6 text-slate-900">Support</h4>
            <ul className="space-y-4 text-sm text-slate-500 font-bold">
              <li><Link href="/help" className="hover:text-primary transition-colors">Help Center</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link href="/disputes" className="hover:text-primary transition-colors">Disputes</Link></li>
              <li><Link href="/status" className="hover:text-primary transition-colors">System Status</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-black mb-6 text-slate-900">Legal</h4>
            <ul className="space-y-4 text-sm text-slate-500 font-bold">
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/compliance" className="hover:text-primary transition-colors">Compliance</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/60 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-400 font-bold">
            &copy; {new Date().getFullYear()} TSLA Technologies. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-slate-400 font-bold">
            <span>Mock Application</span>
            <span>•</span>
            <span>Not a real financial entity</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
