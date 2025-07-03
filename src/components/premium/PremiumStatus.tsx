'use client'

import { useState } from 'react'
import { Crown, Star, Lock, Unlock, Coins, MapPin, Download, Upload, Navigation } from 'lucide-react'
import { useWallet } from '@/components/providers/WalletProvider'

interface PremiumFeature {
  name: string
  description: string
  icon: React.ReactNode
  available: boolean
}

export function PremiumStatus() {
  const { connected, trekBalance } = useWallet()
  const [showFeatures, setShowFeatures] = useState(false)
  
  const isPremium = connected && trekBalance >= 300
  const requiredTokens = 300
  const currentTokens = trekBalance || 0

  const features: PremiumFeature[] = [
    {
      name: 'GPS Trail Navigation',
      description: 'Real-time GPS tracking and navigation during trails',
      icon: <Navigation className="h-5 w-5" />,
      available: isPremium
    },
    {
      name: 'Offline Maps',
      description: 'Download trail maps for offline use',
      icon: <Download className="h-5 w-5" />,
      available: isPremium
    },
    {
      name: 'Upload Trails',
      description: 'Upload and share your own trail discoveries',
      icon: <Upload className="h-5 w-5" />,
      available: isPremium
    },
    {
      name: 'Premium Trail Access',
      description: 'Access to exclusive premium trails and routes',
      icon: <Star className="h-5 w-5" />,
      available: isPremium
    },
    {
      name: 'Enhanced Rewards',
      description: 'Earn 2x TREK tokens for trail completions',
      icon: <Coins className="h-5 w-5" />,
      available: isPremium
    },
    {
      name: 'View Trail Maps',
      description: 'View static trail maps and route information',
      icon: <MapPin className="h-5 w-5" />,
      available: true // Always available for all users
    }
  ]

  const getStatusBadge = () => {
    if (!connected) {
      return (
        <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full">
          <Lock className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Not Connected</span>
        </div>
      )
    }

    if (isPremium) {
      return (
        <div className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full">
          <Crown className="h-4 w-4 text-white" />
          <span className="text-sm font-medium text-white">Premium</span>
        </div>
      )
    }

    return (
      <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 rounded-full">
        <Star className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-medium text-blue-700">Free</span>
      </div>
    )
  }

  const getProgressPercentage = () => {
    if (!connected) return 0
    return Math.min((currentTokens / requiredTokens) * 100, 100)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg">
            <Crown className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Account Status</h3>
            <p className="text-sm text-gray-600">
              {isPremium ? 'Enjoy all premium features!' : 'Upgrade to premium for full access'}
            </p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {connected && !isPremium && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress to Premium</span>
            <span className="text-sm text-gray-600">
              {currentTokens} / {requiredTokens} TREK
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Earn {requiredTokens - currentTokens} more TREK tokens to unlock premium features
          </p>
        </div>
      )}

      <div className="space-y-4">
        <button
          onClick={() => setShowFeatures(!showFeatures)}
          className="w-full text-left flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <span className="font-medium text-gray-900">
            {showFeatures ? 'Hide' : 'Show'} Feature Comparison
          </span>
          <div className={`transform transition-transform ${showFeatures ? 'rotate-180' : ''}`}>
            ↓
          </div>
        </button>

        {showFeatures && (
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  feature.available 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    feature.available 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{feature.name}</h4>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  {feature.available ? (
                    <Unlock className="h-5 w-5 text-green-500" />
                  ) : (
                    <Lock className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!connected && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            <strong>Connect your wallet</strong> to check your TREK token balance and unlock premium features.
          </p>
        </div>
      )}

      {connected && !isPremium && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">
            <strong>Earn TREK tokens</strong> by completing trails to unlock premium features. 
            Each trail completion rewards you with tokens based on difficulty level.
          </p>
        </div>
      )}
    </div>
  )
}

export function usePremiumStatus() {
  const { connected, trekBalance } = useWallet()
  
  const isPremium = connected && trekBalance >= 300
  
  const checkFeatureAccess = (feature: string): boolean => {
    switch (feature) {
      case 'gps_navigation':
      case 'offline_maps':
      case 'upload_trails':
      case 'premium_trails':
      case 'enhanced_rewards':
        return isPremium
      case 'view_maps':
      case 'basic_trails':
        return true
      default:
        return false
    }
  }

  return {
    isPremium,
    connected,
    trekBalance: trekBalance || 0,
    requiredTokens: 300,
    checkFeatureAccess
  }
}
