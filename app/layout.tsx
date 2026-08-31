import type { Metadata } from "next";

import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

import { getCurrentUser } from "@/lib/notifications/identity";

import { Providers } from "@/app/providers";
import { SiteHeader } from "@/components/portal/site-header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CNS HIAA KPI Dashboard",
  description: "CNS HIAA Airport KPI Dashboard",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  /**
   * getCurrentUser() returns null when:
   * - there is no hiaa_session
   * - the session expired
   * - the cookie signature is invalid
   * - the session contains no authorized role
   */
  const user = await getCurrentUser();

  /**
   * Only show Logout for a real Microsoft Entra session.
   *
   * When user is null, this evaluates to false safely.
   */
  const showLogout = user?.authSource === "entra";

  return (
    <html
      lang="en"
      className={`bg-background ${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          {/*
           * The login page must be allowed to render when user === null.
           *
           * If SiteHeader accepts a nullable user, pass it through.
           * Otherwise render the header only when a user exists.
           */}
          {user ? <SiteHeader user={user} showLogout={showLogout} /> : null}

          {children}
        </Providers>
      </body>
    </html>
  );
}
