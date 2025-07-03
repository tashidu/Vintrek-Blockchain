'use client'

import { useState } from 'react'
import { Mountain, Wallet, MapPin, Crown, Shield, Navigation, Download, Upload } from 'lucide-react'
import { BlockchainVerification } from '@/components/blockchain/BlockchainVerification'
import { PremiumStatus } from '@/components/premium/PremiumStatus'
import { TrailMap } from '@/components/maps/TrailMap'
import { FeatureGate, GPSNavigationGate, OfflineMapsGate, UploadTrailsGate } from '@/components/premium/FeatureGate'
import { WalletConnect } from '@/components/wallet/WalletConnect'

export default function DemoPage() {
  const [activeDemo, setActiveDemo] = useState<string>('blockchain')

  // Sample trail data for map demo
  const sampleTrail = {
    name: 'Ella Rock Trail',
    coordinates: [
      { lat: 6.8721, lng: 81.0462 },
      { lat: 6.8731, lng: 81.0472 },
      { lat: 6.8741, lng: 81.0482 },
      { lat: 6.8751, lng: 81.0492 }
    ],
    startPoint: { lat: 6.8721, lng: 81.0462 },
    endPoint: { lat: 6.8751, lng: 81.0492 },
    difficulty: 'Moderate' as const,
    distance: '8.2 km'
  }

  const demos = [
    {
      id: 'blockchain',
      title: 'Blockchain Verification',
      description: 'See how VinTrek uses Cardano blockchain',
      icon: <Shield className="h-6 w-6" />
    },
    {
      id: 'premium',
      title: 'Premium vs Free Account',
      description: 'Compare account features and TREK token requirements',
      icon: <Crown className="h-6 w-6" />
    },
    {
      id: 'map',
      title: 'Trail Maps & GPS',
      description: 'Interactive maps with start/end points like Wikiloc',
      icon: <MapPin className="h-6 w-6" />
    },
    {
      id: 'features',
      title: 'Premium Feature Gates',
      description: 'See how premium features are locked/unlocked',
      icon: <Navigation className="h-6 w-6" />
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Mountain className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">VinTrek Demo</span>
            </div>
            <div className="flex items-center space-x-4">
              <WalletConnect onConnectionChange={() => {}} />
              <a href="/trails" className="text-green-600 hover:text-green-700 transition-colors">
                Back to Trails
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">VinTrek Feature Demo</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore how VinTrek uses blockchain technology, premium accounts, and interactive maps 
            to create a unique eco-tourism experience.
          </p>
        </div>

        {/* Demo Navigation */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {demos.map((demo) => (
            <button
              key={demo.id}
              onClick={() => setActiveDemo(demo.id)}
              className={`p-4 rounded-lg border-2 transition-all ${
                activeDemo === demo.id
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 bg-white hover:border-green-300 text-gray-700'
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <div className={`p-2 rounded-lg mb-2 ${
                  activeDemo === demo.id ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  {demo.icon}
                </div>
                <h3 className="font-semibold mb-1">{demo.title}</h3>
                <p className="text-sm opacity-75">{demo.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Demo Content */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {activeDemo === 'blockchain' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">🔗 Blockchain Verification</h2>
              <p className="text-gray-600 mb-6">
                VinTrek uses Cardano blockchain for transparent bookings, NFT certificates, and token rewards. 
                Connect your wallet to see real blockchain integration.
              </p>
              <BlockchainVerification />
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">How to Verify:</h3>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• Connect your Cardano wallet (Lace, Eternl, Nami, Flint)</li>
                  <li>• Book a trail - transaction recorded on blockchain</li>
                  <li>• Complete trail - receive NFT certificate and TREK tokens</li>
                  <li>• View all transactions on Cardano Explorer</li>
                </ul>
              </div>
            </div>
          )}

          {activeDemo === 'premium' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">👑 Premium vs Free Account</h2>
              <p className="text-gray-600 mb-6">
                Premium accounts are unlocked by holding 300+ TREK tokens in your wallet. 
                No traditional subscriptions - just earn tokens by completing trails!
              </p>
              <PremiumStatus />
              <div className="mt-6 grid md:grid-cols-2 gap-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Free Account (0-299 TREK)</h3>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>✅ View trail maps</li>
                    <li>✅ Book trails</li>
                    <li>✅ Basic rewards</li>
                    <li>❌ GPS navigation</li>
                    <li>❌ Offline maps</li>
                    <li>❌ Upload trails</li>
                  </ul>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h3 className="font-semibold text-yellow-900 mb-2">Premium Account (300+ TREK)</h3>
                  <ul className="text-yellow-800 text-sm space-y-1">
                    <li>✅ All free features</li>
                    <li>✅ GPS navigation</li>
                    <li>✅ Offline maps</li>
                    <li>✅ Upload trails</li>
                    <li>✅ Premium trails</li>
                    <li>✅ 2x token rewards</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeDemo === 'map' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">🗺️ Trail Maps & GPS</h2>
              <p className="text-gray-600 mb-6">
                Interactive trail maps with start/end points, GPS coordinates, and route visualization - 
                similar to Wikiloc but with blockchain rewards!
              </p>
              <TrailMap
                trailName={sampleTrail.name}
                coordinates={sampleTrail.coordinates}
                startPoint={sampleTrail.startPoint}
                endPoint={sampleTrail.endPoint}
                difficulty={sampleTrail.difficulty}
                distance={sampleTrail.distance}
                liveTracking={false}
              />
              <div className="mt-4 grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Start Point:</strong> {sampleTrail.startPoint.lat.toFixed(6)}, {sampleTrail.startPoint.lng.toFixed(6)}
                </div>
                <div>
                  <strong>End Point:</strong> {sampleTrail.endPoint.lat.toFixed(6)}, {sampleTrail.endPoint.lng.toFixed(6)}
                </div>
              </div>
            </div>
          )}

          {activeDemo === 'features' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">🔒 Premium Feature Gates</h2>
              <p className="text-gray-600 mb-6">
                See how premium features are locked for free users and unlocked for premium users. 
                Features are gated based on TREK token balance in your wallet.
              </p>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">GPS Navigation (Premium Only)</h3>
                  <GPSNavigationGate>
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Navigation className="h-5 w-5 text-green-600" />
                        <span className="text-green-800">GPS Navigation Active</span>
                      </div>
                    </div>
                  </GPSNavigationGate>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Offline Maps (Premium Only)</h3>
                  <OfflineMapsGate>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Download className="h-5 w-5 text-blue-600" />
                        <span className="text-blue-800">Download Maps for Offline Use</span>
                      </div>
                    </div>
                  </OfflineMapsGate>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Upload Trails (Premium Only)</h3>
                  <UploadTrailsGate>
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Upload className="h-5 w-5 text-purple-600" />
                        <span className="text-purple-800">Share Your Trail Discoveries</span>
                      </div>
                    </div>
                  </UploadTrailsGate>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="mt-8 text-center">
          <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-2">Ready to Start Your Blockchain Adventure?</h3>
            <p className="mb-4">Connect your wallet and explore Sri Lankan trails while earning TREK tokens and NFTs!</p>
            <a
              href="/trails"
              className="inline-block bg-white text-green-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Explore Trails
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
