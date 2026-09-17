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
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/tsla-logo.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/tsla-logo.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
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
