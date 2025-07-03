'use client'

import { ReactNode } from 'react'
import { Lock, Crown, Star } from 'lucide-react'
import { usePremiumStatus } from './PremiumStatus'

interface FeatureGateProps {
  feature: string
  children: ReactNode
  fallback?: ReactNode
  showUpgrade?: boolean
  className?: string
}

export function FeatureGate({ 
  feature, 
  children, 
  fallback, 
  showUpgrade = true,
  className = '' 
}: FeatureGateProps) {
  const { isPremium, checkFeatureAccess, trekBalance, requiredTokens } = usePremiumStatus()
  
  const hasAccess = checkFeatureAccess(feature)
  
  if (hasAccess) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  const getFeatureName = (feature: string) => {
    switch (feature) {
      case 'gps_navigation': return 'GPS Navigation'
      case 'offline_maps': return 'Offline Maps'
      case 'upload_trails': return 'Upload Trails'
      case 'premium_trails': return 'Premium Trails'
      case 'enhanced_rewards': return 'Enhanced Rewards'
      default: return 'Premium Feature'
    }
  }

  const getFeatureDescription = (feature: string) => {
    switch (feature) {
      case 'gps_navigation': return 'Real-time GPS tracking and turn-by-turn navigation during your hikes'
      case 'offline_maps': return 'Download trail maps for offline use when you have no internet connection'
      case 'upload_trails': return 'Share your own trail discoveries with the VinTrek community'
      case 'premium_trails': return 'Access exclusive trails and premium content'
      case 'enhanced_rewards': return 'Earn 2x TREK tokens for completing trails and activities'
      default: return 'This feature requires a premium account'
    }
  }

  if (!showUpgrade) {
    return (
      <div className={`relative ${className}`}>
        <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center rounded-lg z-10">
          <div className="text-center">
            <Lock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Premium Feature</p>
          </div>
        </div>
        <div className="opacity-30 pointer-events-none">
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6 ${className}`}>
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full">
            <Crown className="h-8 w-8 text-white" />
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Unlock {getFeatureName(feature)}
        </h3>
        
        <p className="text-gray-600 mb-4">
          {getFeatureDescription(feature)}
        </p>

        <div className="bg-white rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Your Progress</span>
            <span className="text-sm text-gray-600">
              {trekBalance} / {requiredTokens} TREK
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((trekBalance / requiredTokens) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Earn {requiredTokens - trekBalance} more TREK tokens to unlock premium features
          </p>
        </div>

        <div className="space-y-2">
          <button className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-2 px-4 rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-colors">
            Learn How to Earn TREK
          </button>
          
          <div className="text-xs text-gray-600">
            Complete trails • Upload content • Participate in community
          </div>
        </div>
      </div>
    </div>
  )
}

// Specific feature gate components for common use cases
export function GPSNavigationGate({ children, className }: { children: ReactNode, className?: string }) {
  return (
    <FeatureGate feature="gps_navigation" className={className}>
      {children}
    </FeatureGate>
  )
}

export function OfflineMapsGate({ children, className }: { children: ReactNode, className?: string }) {
  return (
    <FeatureGate feature="offline_maps" className={className}>
      {children}
    </FeatureGate>
  )
}

export function UploadTrailsGate({ children, className }: { children: ReactNode, className?: string }) {
  return (
    <FeatureGate feature="upload_trails" className={className}>
      {children}
    </FeatureGate>
  )
}

export function PremiumTrailsGate({ children, className }: { children: ReactNode, className?: string }) {
  return (
    <FeatureGate feature="premium_trails" className={className}>
      {children}
    </FeatureGate>
  )
}

// Hook for checking feature access in components
export function useFeatureAccess() {
  const { checkFeatureAccess, isPremium, trekBalance } = usePremiumStatus()
  
  return {
    canUseGPS: checkFeatureAccess('gps_navigation'),
    canDownloadMaps: checkFeatureAccess('offline_maps'),
    canUploadTrails: checkFeatureAccess('upload_trails'),
    canAccessPremiumTrails: checkFeatureAccess('premium_trails'),
    hasEnhancedRewards: checkFeatureAccess('enhanced_rewards'),
    isPremium,
    trekBalance
  }
}
