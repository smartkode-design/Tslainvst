import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, ShieldCheck, Star, Clock, Info, Check, Share2, Heart } from "lucide-react";
import Link from "next/link";

export default function ProductDetailPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex text-sm text-muted-foreground mb-8">
          <Link href="/marketplace" className="hover:text-foreground">Marketplace</Link>
          <span className="mx-2">/</span>
          <Link href="/marketplace?category=esim" className="hover:text-foreground">eSIM</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground font-medium">USA Travel eSIM - 10GB</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="relative aspect-square md:aspect-[4/3] lg:aspect-square bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-900/10 rounded-3xl overflow-hidden border border-border/40 flex items-center justify-center p-12">
            <Globe className="w-full h-full max-w-[240px] max-h-[240px] text-blue-500 drop-shadow-xl" />
            <div className="absolute top-6 right-6 flex gap-2">
              <Button size="icon" variant="outline" className="rounded-full bg-background/50 backdrop-blur border-border/50">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="outline" className="rounded-full bg-background/50 backdrop-blur border-border/50 hover:text-red-500">
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-center">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Badge>eSIM</Badge>
                <div className="flex items-center text-sm font-medium text-amber-500">
                  <Star className="h-4 w-4 fill-amber-500 mr-1" />
                  4.9 (128 reviews)
                </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">USA Travel eSIM - 10GB</h1>
              <div className="flex items-center gap-2 mb-6">
                <span className="text-muted-foreground text-sm">Sold by</span>
                <Badge variant="outline" className="font-medium px-2 py-1 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  GlobalSim Verified
                </Badge>
              </div>
              <div className="text-4xl md:text-5xl font-bold tracking-tight text-primary mb-2">₦12,500</div>
              <p className="text-muted-foreground text-sm flex items-center gap-1">
                <Info className="h-4 w-4" />
                Price includes all taxes and fees.
              </p>
            </div>

            <Card className="mb-8 border-primary/20 bg-primary/5">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full text-primary">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-0.5">Instant Delivery</h4>
                  <p className="text-xs text-muted-foreground">Your eSIM QR code will be delivered instantly to your email and TSLA dashboard.</p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4 mb-8">
              <h3 className="font-semibold text-lg">Key Features</h3>
              <ul className="space-y-3">
                {[
                  "10GB high-speed 5G/4G LTE data",
                  "30 Days validity from activation",
                  "Connects to AT&T and T-Mobile networks",
                  "Data only (No calls/SMS included)",
                  "Keep your physical SIM active for WhatsApp"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-muted-foreground">
                    <Check className="h-5 w-5 text-success shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-4">
              <Button size="lg" className="flex-1 h-14 text-lg">Buy Now</Button>
              <Button size="lg" variant="secondary" className="h-14 px-8">Add to Cart</Button>
            </div>
          </div>
        </div>

        {/* Details and Description */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold mb-6">Product Description</h2>
          <div className="prose prose-gray dark:prose-invert max-w-4xl text-muted-foreground">
            <p>
              Stay connected effortlessly during your trip to the United States with our premium high-speed eSIM. Avoid expensive roaming charges and hunting for local SIM cards at the airport.
            </p>
            <p>
              This eSIM provides 10GB of data valid for 30 days. It operates on the top-tier AT&T and T-Mobile networks, ensuring excellent coverage in cities, national parks, and rural areas across the entire USA.
            </p>
            <p className="font-semibold text-foreground mt-6 mb-2">How to install:</p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>After purchase, you will receive a QR code in your TSLA dashboard.</li>
              <li>Go to Settings {'>'} Cellular {'>'} Add Cellular Plan on your device.</li>
              <li>Scan the QR code and label the plan (e.g., "Travel").</li>
              <li>Turn on Data Roaming for this new line when you arrive in the US.</li>
            </ol>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
