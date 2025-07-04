'use client'

import { useState } from 'react'
import { MapPin, Clock, TrendingUp, Calendar, Lock, Crown, Eye, User, Map, Navigation } from 'lucide-react'
import { BookingModal } from './BookingModal'
import { Trail, TrailRoute } from '@/types'
import { usePremiumStatus } from '@/components/premium/PremiumStatus'
import { useWallet } from '@/components/providers/WalletProvider'

interface TrailCardProps {
  trail: Trail
}

export function TrailCard({ trail }: TrailCardProps) {
  const [showBookingModal, setShowBookingModal] = useState(false)
  const { connected, trekBalance } = useWallet()
  const { isPremium, checkFeatureAccess } = usePremiumStatus()

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800'
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800'
      case 'hard':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleViewTrail = () => {
    if (!trail.available) return
    // Navigate to trail detail page instead of booking modal
    window.location.href = `/trails/${trail.id}`
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Clickable overlay for navigation */}
      <div
        onClick={() => window.location.href = `/trails/${trail.id}`}
        className="cursor-pointer"
      >
        {/* Trail Image */}
        <div className="relative h-48 bg-gray-200">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <div className="absolute top-4 left-4">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(trail.difficulty)}`}>
              {trail.difficulty}
            </span>
          </div>
          <div className="absolute top-4 right-4">
            {trail.available ? (
              <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                Available
              </span>
            ) : (
              <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                Booked
              </span>
            )}
          </div>
          {/* Placeholder for trail image */}
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <MapPin className="h-12 w-12" />
          </div>
        </div>
      </div>

      {/* Trail Info */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{trail.name}</h3>
          <div className="flex items-center text-gray-600 mb-2">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="text-sm">{trail.location}</span>
          </div>
          {trail.isUserContributed && trail.contributedByName && (
            <div className="flex items-center text-blue-600 mb-2">
              <User className="h-4 w-4 mr-1" />
              <span className="text-sm">Added by {trail.contributedByName}</span>
            </div>
          )}

          {/* Route Information */}
          {trail.routes && trail.routes.length > 1 && (
            <div className="flex items-center text-purple-600 mb-2">
              <Map className="h-4 w-4 mr-1" />
              <span className="text-sm">{trail.routes.length} routes available</span>
            </div>
          )}

          {/* Show user-contributed routes */}
          {trail.routes && trail.routes.some(route => route.isUserContributed) && (
            <div className="flex items-center text-orange-600 mb-2">
              <Navigation className="h-4 w-4 mr-1" />
              <span className="text-sm">
                {trail.routes.filter(route => route.isUserContributed).length} community route(s)
              </span>
            </div>
          )}

          <p className="text-gray-600 text-sm">{trail.description}</p>
        </div>

        {/* Trail Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <TrendingUp className="h-4 w-4 mr-2 text-blue-500" />
            <span>{trail.distance}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2 text-green-500" />
            <span>{trail.duration}</span>
          </div>
        </div>

        {/* Access Level and Rewards */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <Eye className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">Free Access</span>
              </div>
              <div className="text-xs text-gray-600">View trail info & map</div>
              {trail.isPremiumOnly && (
                <div className="flex items-center space-x-1 mt-1">
                  <Lock className="h-3 w-3 text-yellow-500" />
                  <span className="text-xs text-yellow-600">GPS requires premium</span>
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1 mb-1">
                {isPremium ? (
                  <Crown className="h-4 w-4 text-yellow-500" />
                ) : (
                  <Lock className="h-4 w-4 text-gray-400" />
                )}
                <span className="text-sm font-medium text-green-600">
                  {isPremium ? 'Enhanced Rewards' : 'Earn Rewards'}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                {isPremium ? '100 TREK + NFT' : '50 TREK + NFT'}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handleViewTrail}
              disabled={!trail.available}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                trail.available
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {trail.available ? 'View Trail' : 'Unavailable'}
            </button>
            {trail.isPremiumOnly && !isPremium ? (
              <button
                type="button"
                title="Premium feature - requires 300 TREK tokens"
                className="px-4 py-2 border border-yellow-300 bg-yellow-50 rounded-lg text-yellow-700 cursor-not-allowed"
                disabled
              >
                <Lock className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                title="View availability calendar"
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setShowBookingModal(true)}
              >
                <Calendar className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Access Information */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="text-xs font-medium text-blue-800 mb-1">
            {connected ? (isPremium ? 'Premium Access' : 'Free Access') : 'Connect Wallet for Full Features'}
          </div>
          <div className="flex items-center justify-between text-xs text-blue-600">
            <span>✓ View trail info</span>
            <span>✓ Static map</span>
            <span>{isPremium ? '✓ GPS navigation' : '🔒 GPS (Premium)'}</span>
          </div>
          {!connected && (
            <div className="text-xs text-blue-600 mt-1">
              Connect wallet to earn TREK tokens & NFTs
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        trail={trail}
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
      />
    </div>
  )
}
