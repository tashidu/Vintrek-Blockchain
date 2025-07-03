'use client'

import { useState } from 'react'
import { Wallet, ChevronDown, LogOut, Copy, ExternalLink } from 'lucide-react'
import { useWallet } from '@/components/providers/WalletProvider'

interface WalletConnectProps {
  onConnectionChange?: (connected: boolean) => void
}

export function WalletConnect({ onConnectionChange }: WalletConnectProps) {
  const {
    connected,
    connecting,
    address,
    balance,
    trekBalance,
    connect,
    disconnect,
    getAvailableWallets
  } = useWallet()
  
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [showAccountModal, setShowAccountModal] = useState(false)

  const availableWallets = getAvailableWallets()

  const handleConnect = async (walletName: string) => {
    try {
      await connect(walletName)
      setShowWalletModal(false)
      onConnectionChange?.(true)
    } catch (error) {
      console.error('Connection failed:', error)
      alert('Failed to connect wallet. Please try again.')
    }
  }

  const handleDisconnect = () => {
    disconnect()
    setShowAccountModal(false)
    onConnectionChange?.(false)
  }

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      alert('Address copied to clipboard!')
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 8)}...${addr.slice(-8)}`
  }

  const formatTrekBalance = () => {
    return `${trekBalance.toFixed(2)} TREK`
  }

  const getWalletDisplayName = (walletName: string) => {
    const names = {
      lace: 'Lace',
      eternl: 'Eternl',
      nami: 'Nami',
      flint: 'Flint',
      typhon: 'Typhon',
      gerowallet: 'GeroWallet',
      ccvault: 'ccvault.io',
      yoroi: 'Yoroi'
    }
    return names[walletName as keyof typeof names] || walletName.charAt(0).toUpperCase() + walletName.slice(1)
  }

  const debugWalletInfo = () => {
    console.log('=== Wallet Debug Info ===')
    console.log('Available wallets:', availableWallets)
    console.log('Current TREK balance:', trekBalance)
    console.log('Window.cardano:', typeof window !== 'undefined' ? window.cardano : 'undefined')
    if (typeof window !== 'undefined' && window.cardano) {
      console.log('Cardano object keys:', Object.keys(window.cardano))
      Object.keys(window.cardano).forEach(key => {
        console.log(`${key}:`, window.cardano![key])
      })
    }
  }

  if (connected && address) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowAccountModal(!showAccountModal)}
          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Wallet className="h-4 w-4" />
          <span className="hidden sm:inline">{formatAddress(address)}</span>
          <ChevronDown className="h-4 w-4" />
        </button>

        {showAccountModal && (
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Connected Wallet</span>
                <button
                  onClick={() => setShowAccountModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {formatTrekBalance()}
              </div>
            </div>
            
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">Address</div>
                  <div className="font-mono text-sm">{formatAddress(address)}</div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={copyAddress}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title="Copy address"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => window.open(`https://cardanoscan.io/address/${address}`, '_blank')}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title="View on explorer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4">
              <button
                onClick={handleDisconnect}
                className="w-full flex items-center justify-center space-x-2 text-red-600 hover:bg-red-50 py-2 px-4 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Disconnect</span>
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowWalletModal(true)}
        disabled={connecting}
        className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
      >
        <Wallet className="h-4 w-4" />
        <span>{connecting ? 'Connecting...' : 'Connect Wallet'}</span>
      </button>

      {showWalletModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Connect Wallet</h3>
              <button
                onClick={() => setShowWalletModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            {availableWallets.length === 0 ? (
              <div className="text-center py-8">
                <Wallet className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Wallets Found</h4>
                <p className="text-gray-600 mb-4">
                  Please install a Cardano wallet to continue.
                </p>
                <div className="space-y-2">
                  <a
                    href="https://www.lace.io/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Install Lace Wallet
                  </a>
                  <a
                    href="https://eternl.io/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Install Eternl Wallet
                  </a>
                  <button
                    onClick={() => window.location.reload()}
                    className="block w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Refresh Page (After Installing Wallet)
                  </button>
                  <button
                    onClick={debugWalletInfo}
                    className="block w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors mt-2"
                  >
                    Debug Wallet Info (Check Console)
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-gray-600 mb-4">
                  Choose a wallet to connect to VinTrek:
                </p>
                {availableWallets.map((walletName) => (
                  <button
                    key={walletName}
                    onClick={() => handleConnect(walletName)}
                    disabled={connecting}
                    className="w-full flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <Wallet className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium">{getWalletDisplayName(walletName)}</div>
                      <div className="text-sm text-gray-500">
                        Click to connect
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
