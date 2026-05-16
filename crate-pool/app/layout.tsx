"use client"

import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import {NavbarPresenter} from "@/presenters/navbar-presenter";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { useUserStore } from "@/models/useUserStore";
import LoginPresenter from "@/presenters/login-presenter";
import { Spinner } from "@/components/ui/spinner";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const authStatus = useUserStore((s) => s.authStatus);
  const fetchUser = useUserStore((s) => s.fetchUser);

  useEffect(() => {
    // ensure we fetch current user once on client mount
    fetchUser();
  }, [fetchUser]);

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", fontSans.variable)}
    >
      <body>
        <ThemeProvider>
            <NavbarPresenter />
            <main>
              {authStatus === "loading" && (
                <div className="p-4">
                  <Spinner />
                </div>
              )}
              {authStatus === "unauthenticated" && <LoginPresenter />}
              {authStatus === "authenticated" && children}
            </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
