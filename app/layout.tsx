import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { SiteHeader } from '@/components/portal/site-header'
import { getCurrentUser } from '@/lib/notifications/identity'
import './globals.css'

const geistSans = Geist({ subsets: ['latin'], variable: '--font-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'CNS HIAA | Airport KPI Dashboard',
  description:
    'Executive reporting portal for all CNS HIAA airport operational KPIs. Navigate 21 individual KPI dashboards from a single, unified interface.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#1a2540',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await getCurrentUser()
  // Easy Auth exposes a logout endpoint only for real Entra sessions; the dev
  // fallback has no session to end, so no logout link is passed in that mode.
  const logoutHref = user.authSource === "entra" ? "/.auth/logout?post_logout_redirect_uri=/" : undefined
  return (
    <html lang="en" className={`bg-background ${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <SiteHeader user={user} logoutHref={logoutHref} />
        {children}
      </body>
    </html>
  )
}
