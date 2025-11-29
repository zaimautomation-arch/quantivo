// app/layout.tsx
import type { Metadata } from "next";
import { UserAvatar } from "@/components/UserAvatar";
import "./globals.css";
import Link from "next/link";
import React from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { cookies } from "next/headers";
import { normalizeLang } from "@/lib/i18n";
import {
  Home,
  MessageCircle,
  Megaphone,
  Newspaper,
  User,
} from "lucide-react";
import { RegisterSW } from "@/components/RegisterSW";

export const metadata: Metadata = {
  title: "Quantivo – AI Investing Copilot",
  description:
    "Quantivo is your AI investing copilot: educational ideas on stocks, ETFs and crypto, plus a place for sponsors and partners to reach investors.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo.png",
  },
  manifest: "/manifest.json",
  themeColor: "#020617",
  appleWebApp: {
    capable: true,
    title: "Quantivo",
    statusBarStyle: "black-translucent",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // lingua dal cookie (fallback en)
  const cookieStore = await cookies();
  const langCookie: string =
    cookieStore.get("quantivo-lang")?.value ?? "en";
  const lang = normalizeLang(langCookie);

  return (
    <html lang={lang} data-theme="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased">
        <ThemeProvider>
          {/* registra il service worker lato client */}
          <RegisterSW />

          <div className="flex min-h-screen flex-col app-bg">
            {/* Top bar desktop */}
            <header className="border-b border-slate-800 bg-slate-950/95 px-4 py-3 text-slate-50 backdrop-blur md:px-8">
              <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
                {/* Logo + brand */}
                <Link href="/" className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900">
                    <img
                      src="/logo.png"
                      alt="Quantivo logo"
                      className="h-7 w-7 rounded-full object-contain"
                    />
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="text-sm font-semibold">Quantivo</span>
                    <span className="text-[11px] text-slate-400">
                      AI investing copilot
                    </span>
                  </div>
                </Link>

                {/* Nav + avatar a destra */}
                <div className="flex items-center gap-4">
                  <nav className="hidden items-center gap-4 text-sm text-slate-200 md:flex">
                    <Link
                      href="/"
                      className="transition-colors hover:text-emerald-300"
                    >
                      Home
                    </Link>
                    <Link
                      href="/chat"
                      className="transition-colors hover:text-emerald-300"
                    >
                      Chat
                    </Link>
                    <Link
                      href="/ads"
                      className="transition-colors hover:text-emerald-300"
                    >
                      Ads
                    </Link>
                    <Link
                      href="/news"
                      className="transition-colors hover:text-emerald-300"
                    >
                      News
                    </Link>
                    <Link
                      href="/account"
                      className="transition-colors hover:text-emerald-300"
                    >
                      Account
                    </Link>
                  </nav>

                  {/* Avatar utente in alto a destra */}
                  <UserAvatar />
                </div>
              </div>
            </header>

            {/* Contenuto */}
            <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 pb-20 pt-4 md:px-8 md:pb-10">
              {children}
              {/* Spazio per non far coprire il contenuto dalla navbar mobile */}
              <div className="h-14 md:hidden" />
            </main>

            {/* Tab bar mobile */}
            <nav className="fixed bottom-0 left-0 right-0 z-20 flex h-14 items-center justify-around border-t border-slate-800 bg-slate-950/95 text-[11px] text-slate-200 backdrop-blur md:hidden">
              <Link href="/" className="flex flex-col items-center gap-1">
                <Home className="h-5 w-5" />
                <span>Home</span>
              </Link>
              <Link href="/chat" className="flex flex-col items-center gap-1">
                <MessageCircle className="h-5 w-5" />
                <span>Chat</span>
              </Link>
              <Link href="/ads" className="flex flex-col items-center gap-1">
                <Megaphone className="h-5 w-5" />
                <span>Ads</span>
              </Link>
              <Link href="/news" className="flex flex-col items-center gap-1">
                <Newspaper className="h-5 w-5" />
                <span>News</span>
              </Link>
              <Link href="/account" className="flex flex-col items-center gap-1">
                <User className="h-5 w-5" />
                <span>Account</span>
              </Link>
            </nav>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
