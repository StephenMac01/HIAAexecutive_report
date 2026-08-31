import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { SiteHeader } from '@/components/portal/site-header'
import { Providers } from '@/app/providers'
import { getCurrentUser } from '@/lib/notifications/identity'
import './globals.css'

const geistSans = Geist({ subsets: ['latin'], variable: '--font-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'CNS HIAA | Airport KPI Dashboard',
  description:
    'Executive reporting portal for all CNS HIAA airport operational KPIs. Navigate 21 individual KPI dashboards from a single, unified interface.',
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
  // Logout is a client-side MSAL action, shown only for a real signed-in Entra
  // session (never for the dev fallback or the anonymous /login state).
  const showLogout = user.authSource === "entra"
  return (
    <html lang="en" className={`bg-background ${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          <SiteHeader user={user} showLogout={showLogout} />
          {children}
        </Providers>
      </body>
    </html>
  )
}
