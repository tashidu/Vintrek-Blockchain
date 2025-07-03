'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { blockchainService } from '@/lib/blockchain'

interface WalletContextType {
  wallet: any | null
  connected: boolean
  connecting: boolean
  address: string | null
  balance: string | null
  trekBalance: number
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
  const [trekBalance, setTrekBalance] = useState<number>(0)

  const getAvailableWallets = () => {
    if (typeof window === 'undefined') return []

    const wallets = []

    // Check for common Cardano wallets
    if (window.cardano?.lace) wallets.push('lace')
    if (window.cardano?.eternl) wallets.push('eternl')
    if (window.cardano?.nami) wallets.push('nami')
    if (window.cardano?.flint) wallets.push('flint')
    if (window.cardano?.typhon) wallets.push('typhon')
    if (window.cardano?.gerowallet) wallets.push('gerowallet')
    if (window.cardano?.ccvault) wallets.push('ccvault')
    if (window.cardano?.yoroi) wallets.push('yoroi')

    // Debug logging
    console.log('Checking for wallets...')
    console.log('window.cardano:', window.cardano)
    console.log('Available wallets found:', wallets)

    return wallets
  }

  const connect = async (walletName: string) => {
    if (typeof window === 'undefined') {
      throw new Error('Window is undefined - not in browser environment')
    }

    console.log(`Attempting to connect to ${walletName} wallet...`)
    setConnecting(true)

    try {
      // Check if cardano object exists
      if (!window.cardano) {
        throw new Error('No Cardano wallets detected. Please install a Cardano wallet extension.')
      }

      // Check if specific wallet is available
      if (!window.cardano[walletName]) {
        throw new Error(`${walletName} wallet not found. Please install ${walletName} wallet extension.`)
      }

      console.log(`Found ${walletName} wallet, attempting to enable...`)

      // Enable the wallet
      const walletApi = await window.cardano[walletName].enable()
      console.log('Wallet enabled successfully:', walletApi)
      setWallet(walletApi)

      // Get wallet address
      try {
        const addresses = await walletApi.getUsedAddresses()
        console.log('Fetched addresses:', addresses)
        if (addresses.length > 0) {
          setAddress(addresses[0])
        } else {
          // Try to get unused addresses if no used addresses
          const unusedAddresses = await walletApi.getUnusedAddresses()
          if (unusedAddresses.length > 0) {
            setAddress(unusedAddresses[0])
          }
        }
      } catch (error) {
        console.warn('Could not fetch addresses:', error)
      }

      // Get wallet balance (ADA)
      try {
        const balance = await walletApi.getBalance()
        console.log('Fetched ADA balance:', balance)
        setBalance(balance)
      } catch (error) {
        console.warn('Could not fetch ADA balance:', error)
        setBalance('0')
      }

      // Get TREK token balance
      try {
        blockchainService.setWallet(walletApi)
        const trekBal = await blockchainService.getTrekTokenBalance()
        console.log('Fetched TREK balance:', trekBal)
        setTrekBalance(trekBal)
      } catch (error) {
        console.warn('Could not fetch TREK balance:', error)
        setTrekBalance(0)
      }

      setConnected(true)
      console.log(`Successfully connected to ${walletName}`)

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
    setTrekBalance(0)
    localStorage.removeItem('vintrek_wallet')
  }

  // Auto-reconnect on page load
  useEffect(() => {
    const savedWallet = localStorage.getItem('vintrek_wallet')
    if (savedWallet && getAvailableWallets().includes(savedWallet)) {
      connect(savedWallet).catch(console.error)
    }
  }, [])

  const value: WalletContextType = {
    wallet,
    connected,
    connecting,
    address,
    balance,
    trekBalance,
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
