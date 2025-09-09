import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Core Sure - Discover Your Sovereign Face',
  description: 'A 7-minute quiz to discover your core profile and sovereign face alignment. One face, seven lines, aligned they reveal your core.',
  keywords: 'personality quiz, core profile, sovereign face, self-discovery, psychology',
  authors: [{ name: 'Core Sure' }],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: '#1c1917',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Core Sure',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#1c1917" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Core Sure" />
      </head>
      <body className={`${inter.className} bg-brand-gray-950 text-brand-gray-100`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
