'use client'

import { useState, useEffect } from 'react'
import { Shield, CheckCircle, ExternalLink, Wallet, Coins, FileText, Eye } from 'lucide-react'
import { useWallet } from '@/components/providers/WalletProvider'

interface BlockchainIndicator {
  name: string
  status: 'connected' | 'disconnected' | 'loading'
  description: string
  verificationUrl?: string
}

export function BlockchainVerification() {
  const { connected, address, balance, trekBalance } = useWallet()
  const [indicators, setIndicators] = useState<BlockchainIndicator[]>([])
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const updateIndicators = () => {
      const newIndicators: BlockchainIndicator[] = [
        {
          name: 'Wallet Connection',
          status: connected ? 'connected' : 'disconnected',
          description: connected 
            ? `Connected to Cardano wallet: ${address?.slice(0, 8)}...${address?.slice(-8)}`
            : 'No wallet connected - Connect to verify blockchain integration',
          verificationUrl: connected ? `https://preview.cardanoscan.io/address/${address}` : undefined
        },
        {
          name: 'ADA Balance',
          status: connected && balance ? 'connected' : 'disconnected',
          description: connected 
            ? `Current balance: ${balance} ADA`
            : 'Connect wallet to view ADA balance',
          verificationUrl: connected ? `https://preview.cardanoscan.io/address/${address}` : undefined
        },
        {
          name: 'TREK Tokens',
          status: connected && trekBalance !== undefined ? 'connected' : 'disconnected',
          description: connected 
            ? `TREK tokens: ${trekBalance} (${trekBalance >= 300 ? 'Premium' : 'Free'} account)`
            : 'Connect wallet to view TREK token balance',
          verificationUrl: connected ? `https://preview.cardanoscan.io/address/${address}` : undefined
        },
        {
          name: 'Blockchain Network',
          status: 'connected',
          description: 'Connected to Cardano Testnet (Preview)',
          verificationUrl: 'https://preview.cardanoscan.io'
        }
      ]
      setIndicators(newIndicators)
    }

    updateIndicators()
  }, [connected, address, balance, trekBalance])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'loading':
        return <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      default:
        return <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'border-green-200 bg-green-50'
      case 'loading':
        return 'border-blue-200 bg-blue-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Blockchain Verification</h3>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-blue-600 hover:text-blue-700 transition-colors"
        >
          <Eye className="h-5 w-5" />
        </button>
      </div>

      <p className="text-gray-600 mb-6">
        VinTrek uses Cardano blockchain for transparent bookings, NFT certificates, and token rewards. 
        Verify our blockchain integration below:
      </p>

      <div className="space-y-3">
        {indicators.map((indicator, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${getStatusColor(indicator.status)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(indicator.status)}
                <div>
                  <h4 className="font-medium text-gray-900">{indicator.name}</h4>
                  <p className="text-sm text-gray-600">{indicator.description}</p>
                </div>
              </div>
              {indicator.verificationUrl && (
                <a
                  href={indicator.verificationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 transition-colors"
                  title="View on Cardano Explorer"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {showDetails && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-3">How to Verify Blockchain Integration:</h4>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex items-start space-x-2">
              <Wallet className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Connect your Cardano wallet (Lace, Eternl, Nami, or Flint)</span>
            </div>
            <div className="flex items-start space-x-2">
              <Coins className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Book a trail - transaction will be recorded on Cardano blockchain</span>
            </div>
            <div className="flex items-start space-x-2">
              <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Complete a trail - receive NFT certificate and TREK tokens</span>
            </div>
            <div className="flex items-start space-x-2">
              <ExternalLink className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>View all transactions on Cardano Explorer (preview.cardanoscan.io)</span>
            </div>
          </div>
        </div>
      )}

      {!connected && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">
            <strong>Connect your wallet</strong> to see full blockchain verification and access premium features.
          </p>
        </div>
      )}
    </div>
  )
}
