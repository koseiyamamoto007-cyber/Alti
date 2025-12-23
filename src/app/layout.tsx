import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Alti - Advanced Goal Tracking",
  description: "Elevate your potential with Alti.",
  manifest: "/manifest.json",
};

import { Sidebar, MobileHeader } from "@/components/layout/header";
import { ChatWidget } from "@/components/chat/chat-widget";
import { AuthSync } from "@/components/auth-sync";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950`}
      >
        <AuthSync />
        <Sidebar />
        <MobileHeader />
        <div className="pt-16 md:pt-0 md:pl-[300px]">
          {children}
        </div>
        <ChatWidget />
      </body>
    </html>
  );
}
