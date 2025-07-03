'use client'

import { ReactNode } from 'react'
import { WalletProvider } from './WalletProvider'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

interface ClientProvidersProps {
  children: ReactNode
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ErrorBoundary>
      <WalletProvider>
        {children}
      </WalletProvider>
    </ErrorBoundary>
  )
}
