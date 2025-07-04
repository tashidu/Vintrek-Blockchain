import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ClientProviders } from '@/components/providers/ClientProviders'
import { MapPreloader } from '@/components/maps/MapPreloader'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'VinTrek - Blockchain-Powered Eco-Tourism',
  description: 'Discover, book, and earn rewards for hiking and camping adventures in Sri Lanka. Mint NFTs, earn TREK tokens, and unlock AR/VR experiences.',
  keywords: 'blockchain, eco-tourism, hiking, camping, NFT, Cardano, Sri Lanka, trails',
  authors: [{ name: 'VinTrek Team' }],
  openGraph: {
    title: 'VinTrek - Blockchain-Powered Eco-Tourism',
    description: 'Discover trails, mint NFTs, and earn rewards for your outdoor adventures',
    type: 'website',
    locale: 'en_US',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MapPreloader />
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}
