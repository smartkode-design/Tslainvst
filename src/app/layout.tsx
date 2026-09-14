import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TSLA | Digital Marketplace & Services",
  description: "Buy digital products, access everyday services, fund your wallet and trade through a trusted marketplace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground relative">
        <ThemeProvider>
          {/* Eye-Catchy Ambient Background Atmosphere (Both Light and Dark Modes) */}
          <div className="ambient-bg">
            <div className="ambient-dot-grid" />
            <div className="ambient-glow-1" />
            <div className="ambient-glow-2" />
          </div>
          
          <div className="relative z-10">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
