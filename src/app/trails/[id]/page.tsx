'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import {
  MapPin, Clock, TrendingUp, Users, Star, Calendar,
  Trophy, Coins, Camera, ArrowLeft, Share2, User
} from 'lucide-react'
import { BookingModal } from '@/components/trails/BookingModal'
import { TrailCompletion } from '@/components/trails/TrailCompletion'
import { TrailMap } from '@/components/maps/TrailMap'
import { BlockchainVerification } from '@/components/blockchain/BlockchainVerification'
import { PremiumStatus, usePremiumStatus } from '@/components/premium/PremiumStatus'
import { Trail } from '@/types'

// Mock trail data - in production, this would come from an API
const mockTrails: Trail[] = [
  {
    id: '1',
    name: 'Ella Rock Trail',
    location: 'Ella, Sri Lanka',
    difficulty: 'Moderate',
    distance: '8.2 km',
    duration: '4-5 hours',
    description: 'A scenic hike offering panoramic views of the hill country with tea plantations and valleys. This trail takes you through lush green landscapes and offers some of the most breathtaking views in Sri Lanka.',
    price: 2500,
    available: true,
    features: ['Scenic Views', 'Tea Plantations', 'Photography Spots', 'Wildlife Viewing'],
    maxCapacity: 20,
    currentBookings: 12,
    coordinates: { lat: 6.8721, lng: 81.0462 },
    startPoint: { lat: 6.8721, lng: 81.0462 },
    endPoint: { lat: 6.8751, lng: 81.0492 },
    gpsRoute: [
      { lat: 6.8721, lng: 81.0462 },
      { lat: 6.8731, lng: 81.0472 },
      { lat: 6.8741, lng: 81.0482 },
      { lat: 6.8751, lng: 81.0492 }
    ],
    isUserContributed: false,
    isPremiumOnly: false
  },
  {
    id: '2',
    name: 'Adam\'s Peak (Sri Pada)',
    location: 'Ratnapura, Sri Lanka',
    difficulty: 'Hard',
    distance: '11.5 km',
    duration: '6-8 hours',
    description: 'Sacred mountain pilgrimage with breathtaking sunrise views from the summit.',
    price: 3500,
    available: true,
    features: ['Sunrise Views', 'Religious Site', 'Night Hiking'],
    maxCapacity: 50,
    currentBookings: 35,
    coordinates: { lat: 6.8094, lng: 80.4992 },
    startPoint: { lat: 6.8094, lng: 80.4992 },
    endPoint: { lat: 6.8094, lng: 80.4992 },
    gpsRoute: [
      { lat: 6.8094, lng: 80.4992 },
      { lat: 6.8104, lng: 80.5002 },
      { lat: 6.8114, lng: 80.5012 },
      { lat: 6.8124, lng: 80.5022 },
      { lat: 6.8094, lng: 80.4992 }
    ],
    isUserContributed: false,
    isPremiumOnly: false
  },
  {
    id: '3',
    name: 'Horton Plains National Park',
    location: 'Nuwara Eliya, Sri Lanka',
    difficulty: 'Easy',
    distance: '9.5 km',
    duration: '3-4 hours',
    description: 'UNESCO World Heritage site featuring World\'s End cliff and Baker\'s Falls.',
    price: 4000,
    available: false,
    features: ['World\'s End', 'Baker\'s Falls', 'Wildlife Viewing'],
    maxCapacity: 30,
    currentBookings: 30,
    coordinates: { lat: 6.8069, lng: 80.7906 },
    startPoint: { lat: 6.8069, lng: 80.7906 },
    endPoint: { lat: 6.8099, lng: 80.7936 },
    gpsRoute: [
      { lat: 6.8069, lng: 80.7906 },
      { lat: 6.8079, lng: 80.7916 },
      { lat: 6.8089, lng: 80.7926 },
      { lat: 6.8099, lng: 80.7936 }
    ],
    isUserContributed: false,
    isPremiumOnly: true
  },
  {
    id: '4',
    name: 'Hidden Waterfall Trail',
    location: 'Kandy, Sri Lanka',
    difficulty: 'Moderate',
    distance: '6.8 km',
    duration: '3-4 hours',
    description: 'A beautiful hidden waterfall discovered by local hikers. This trail leads through dense forest to a stunning 40-meter waterfall with natural swimming pools.',
    price: 0,
    available: true,
    features: ['Waterfall', 'Swimming', 'Forest Trail', 'Photography'],
    maxCapacity: 15,
    currentBookings: 8,
    coordinates: { lat: 7.2906, lng: 80.6337 },
    startPoint: { lat: 7.2906, lng: 80.6337 },
    endPoint: { lat: 7.2956, lng: 80.6387 },
    gpsRoute: [
      { lat: 7.2906, lng: 80.6337 },
      { lat: 7.2916, lng: 80.6347 },
      { lat: 7.2926, lng: 80.6357 },
      { lat: 7.2936, lng: 80.6367 },
      { lat: 7.2946, lng: 80.6377 },
      { lat: 7.2956, lng: 80.6387 }
    ],
    isUserContributed: true,
    contributedBy: 'addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3n0d3vllmyqwsx5wktcd8cc3sq835lu7drv2xwl2wywfgse35a3x',
    contributedByName: 'Hiking_Explorer_LK',
    isPremiumOnly: false
  }
]

export default function TrailDetailPage() {
  const params = useParams()
  const trailId = params.id as string
  const { isPremium, checkFeatureAccess } = usePremiumStatus()

  const [trail, setTrail] = useState<Trail | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [selectedRouteId, setSelectedRouteId] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    const foundTrail = mockTrails.find(t => t.id === trailId)
    setTrail(foundTrail || null)
    setLoading(false)

    // Set default route if trail has routes
    if (foundTrail?.routes && foundTrail.routes.length > 0) {
      setSelectedRouteId(foundTrail.defaultRouteId || foundTrail.routes[0].id)
    }
  }, [trailId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!trail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Trail Not Found</h2>
          <p className="text-gray-600 mb-4">The trail you're looking for doesn't exist.</p>
          <button
            onClick={() => window.location.href = '/trails'}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Back to Trails
          </button>
        </div>
      </div>
    )
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'moderate': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRewardAmount = (difficulty: string): number => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 50
      case 'moderate': return 75
      case 'hard': return 100
      default: return 50
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${trail.name} - VinTrek`,
        text: `Check out this amazing trail: ${trail.name}`,
        url: window.location.href,
      })
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href)
      alert('Trail link copied to clipboard!')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.location.href = '/trails'}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Trails</span>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Share2 className="h-5 w-5" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Trail Hero Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          {/* Trail Image */}
          <div className="relative h-64 md:h-96 bg-gradient-to-r from-green-400 to-blue-500">
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            <div className="absolute top-4 left-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(trail.difficulty)}`}>
                {trail.difficulty}
              </span>
            </div>
            <div className="absolute top-4 right-4">
              {trail.available ? (
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Available
                </span>
              ) : (
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Fully Booked
                </span>
              )}
            </div>
            {/* Placeholder for trail image */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Camera className="h-16 w-16 text-white opacity-50" />
            </div>
          </div>

          {/* Trail Info */}
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{trail.name}</h1>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center text-gray-600">
                <MapPin className="h-5 w-5 mr-2 text-blue-500" />
                <span>{trail.location}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                <span>{trail.distance}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="h-5 w-5 mr-2 text-purple-500" />
                <span>{trail.duration}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Users className="h-5 w-5 mr-2 text-orange-500" />
                <span>{trail.maxCapacity - trail.currentBookings} spots left</span>
              </div>
            </div>

            {/* Contributor Information */}
            {trail.isUserContributed && trail.contributedByName && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center text-blue-700">
                  <User className="h-5 w-5 mr-2" />
                  <span className="font-medium">Trail contributed by {trail.contributedByName}</span>
                </div>
                <p className="text-blue-600 text-sm mt-1">
                  This trail was added by a community member and verified by our team.
                </p>
              </div>
            )}

            <p className="text-gray-600 text-lg leading-relaxed mb-6">{trail.description}</p>

            {/* Trail Map */}
            {trail.gpsRoute && trail.startPoint && trail.endPoint && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Trail Route</h3>
                {trail.isPremiumOnly && !isPremium ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-yellow-800 text-sm">
                      🔒 This is a premium trail. You need 300 TREK tokens to access the full route and GPS navigation.
                    </p>
                  </div>
                ) : null}
                <TrailMap
                  trailName={trail.name}
                  coordinates={trail.gpsRoute || []}
                  startPoint={trail.startPoint}
                  endPoint={trail.endPoint}
                  difficulty={trail.difficulty}
                  distance={trail.distance}
                  liveTracking={false}
                  className="mb-4"
                  routes={trail.routes}
                  selectedRouteId={selectedRouteId}
                  onRouteChange={setSelectedRouteId}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <strong>Start Point:</strong> {trail.startPoint.lat.toFixed(6)}, {trail.startPoint.lng.toFixed(6)}
                  </div>
                  <div>
                    <strong>End Point:</strong> {trail.endPoint.lat.toFixed(6)}, {trail.endPoint.lng.toFixed(6)}
                  </div>
                </div>
              </div>
            )}

            {/* Features */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Trail Features</h3>
              <div className="flex flex-wrap gap-2">
                {trail.features.map((feature, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {feature}
                  </span>
                ))}
                {trail.isUserContributed && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    👤 User Contributed
                  </span>
                )}
                {trail.isPremiumOnly && (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                    👑 Premium Only
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Blockchain Rewards */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Blockchain Rewards</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Trophy className="h-6 w-6 text-green-600 mr-2" />
                    <span className="font-semibold text-green-800">Trail NFT Certificate</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Mint a unique NFT proving your trail completion with location and timestamp data.
                  </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Coins className="h-6 w-6 text-yellow-600 mr-2" />
                    <span className="font-semibold text-yellow-800">{getRewardAmount(trail.difficulty)} TREK Tokens</span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    Earn utility tokens that can be redeemed for premium features and discounts.
                  </p>
                </div>
              </div>
            </div>

            {/* Trail Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Trail Information</h2>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">Difficulty Level</h4>
                  <p className="text-gray-600">
                    This trail is rated as <strong>{trail.difficulty}</strong>. 
                    {trail.difficulty === 'Easy' && ' Suitable for beginners and families.'}
                    {trail.difficulty === 'Moderate' && ' Requires basic fitness and hiking experience.'}
                    {trail.difficulty === 'Hard' && ' Challenging trail for experienced hikers only.'}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">What to Bring</h4>
                  <ul className="text-gray-600 list-disc list-inside space-y-1">
                    <li>Comfortable hiking shoes</li>
                    <li>Water and snacks</li>
                    <li>Sun protection (hat, sunscreen)</li>
                    <li>Camera for memories</li>
                    <li>First aid kit</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Best Time to Visit</h4>
                  <p className="text-gray-600">
                    Early morning (6:00 AM - 8:00 AM) for the best weather and views. 
                    Avoid rainy season (May - September) for safety.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-gray-900">₨{trail.price.toLocaleString()}</div>
                <div className="text-gray-600">per person</div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Availability:</span>
                  <span className={trail.available ? 'text-green-600' : 'text-red-600'}>
                    {trail.available ? 'Available' : 'Fully Booked'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Capacity:</span>
                  <span className="text-gray-900">{trail.currentBookings}/{trail.maxCapacity}</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setShowBookingModal(true)}
                  disabled={!trail.available}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    trail.available
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {trail.available ? 'Book This Trail' : 'Fully Booked'}
                </button>
                
                <button
                  onClick={() => setShowCompletionModal(true)}
                  className="w-full py-3 px-4 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                >
                  Mark as Completed
                </button>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="text-xs font-medium text-blue-800 mb-1">Blockchain Features</div>
                <div className="flex items-center justify-between text-xs text-blue-600">
                  <span>✓ On-chain booking</span>
                  <span>✓ NFT certificate</span>
                  <span>✓ Token rewards</span>
                </div>
              </div>
            </div>

            {/* Premium Status */}
            <PremiumStatus />

            {/* Blockchain Verification */}
            <BlockchainVerification />

            {/* Reviews Preview */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Reviews</h3>
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="ml-2 text-gray-600">4.8 (24 reviews)</span>
              </div>
              <div className="space-y-3">
                <div className="border-l-4 border-green-500 pl-3">
                  <p className="text-sm text-gray-600">"Amazing views and well-marked trail!"</p>
                  <p className="text-xs text-gray-500">- Sarah M.</p>
                </div>
                <div className="border-l-4 border-green-500 pl-3">
                  <p className="text-sm text-gray-600">"Perfect for a morning hike. Loved the NFT!"</p>
                  <p className="text-xs text-gray-500">- John D.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <BookingModal
        trail={trail}
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
      />

      <TrailCompletion
        trail={trail}
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        onComplete={() => {
          setShowCompletionModal(false)
          alert('Trail completed! Check your dashboard for your new NFT and tokens.')
        }}
      />
    </div>
  )
}
