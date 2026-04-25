import type { Metadata } from 'next'
import { IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'
import Providers from './providers'

const ibmPlexSans = IBM_Plex_Sans({
  variable: '--font-sans',
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500', '600'],
})

const ibmPlexMono = IBM_Plex_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
})

export const metadata: Metadata = {
  title: 'SLDt',
  description: 'Автоматизация электротехнической документации по ГОСТ 21.613-2014',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} h-full`}>
      <body className="h-full font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
