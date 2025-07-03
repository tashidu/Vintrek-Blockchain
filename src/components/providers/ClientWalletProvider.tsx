'use client'

import { ReactNode, useEffect, useState, createContext, useContext } from 'react'
import { WalletProvider } from './WalletProvider'

interface ClientWalletProviderProps {
  children: ReactNode
}

// Default wallet context for SSR
const defaultWalletContext = {
  wallet: null,
  connected: false,
  connecting: false,
  address: null,
  balance: null,
  connect: async () => {},
  disconnect: () => {},
  getAvailableWallets: () => [],
}

const WalletContext = createContext(defaultWalletContext)

export function ClientWalletProvider({ children }: ClientWalletProviderProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Provide default context during SSR
    return (
      <WalletContext.Provider value={defaultWalletContext}>
        {children}
      </WalletContext.Provider>
    )
  }

  return <WalletProvider>{children}</WalletProvider>
}
