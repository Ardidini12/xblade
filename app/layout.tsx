import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { initializeApp } from "@/lib/appInitialization";

// Initialize app services when module loads (non-blocking)
// This ensures services are ready before any requests are handled
if (typeof window === 'undefined') {
  // Only run on server side
  initializeApp().catch((error) => {
    console.error('Failed to initialize app:', error);
  });
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "XBLADE",
  description: "The Ultimate Pro Clubs Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
