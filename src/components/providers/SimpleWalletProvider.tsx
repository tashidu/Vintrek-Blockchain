'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface WalletContextType {
  wallet: any | null
  connected: boolean
  connecting: boolean
  address: string | null
  balance: string | null
  connect: (walletName: string) => Promise<void>
  disconnect: () => void
  getAvailableWallets: () => string[]
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

interface WalletProviderProps {
  children: ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [wallet, setWallet] = useState<any | null>(null)
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState<string | null>(null)

  const getAvailableWallets = () => {
    if (typeof window === 'undefined') return []
    
    const wallets = []
    if (window.cardano?.lace) wallets.push('lace')
    if (window.cardano?.eternl) wallets.push('eternl')
    if (window.cardano?.nami) wallets.push('nami')
    if (window.cardano?.flint) wallets.push('flint')
    
    return wallets
  }

  const connect = async (walletName: string) => {
    if (typeof window === 'undefined') return
    
    setConnecting(true)
    try {
      // Simulate wallet connection for now
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock wallet data
      setWallet({ name: walletName })
      setAddress('addr1qxy...mock_address')
      setBalance('250.75 TREK')
      setConnected(true)
      
      // Store connection state
      localStorage.setItem('vintrek_wallet', walletName)
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      throw error
    } finally {
      setConnecting(false)
    }
  }

  const disconnect = () => {
    setWallet(null)
    setConnected(false)
    setAddress(null)
    setBalance(null)
    localStorage.removeItem('vintrek_wallet')
  }

  const value: WalletContextType = {
    wallet,
    connected,
    connecting,
    address,
    balance,
    connect,
    disconnect,
    getAvailableWallets,
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}
