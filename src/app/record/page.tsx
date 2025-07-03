'use client'

import { useState } from 'react'
import { Mountain, ArrowLeft, Trophy, Coins } from 'lucide-react'
import Link from 'next/link'
import { TrailRecorder } from '@/components/trail/TrailRecorder'
import { LocationStatus } from '@/components/trail/LocationStatus'
import { useWallet } from '@/components/providers/WalletProvider'
import { CompletedTrail } from '@/types/trail'

export default function RecordPage() {
  const { connected } = useWallet()
  const [completedTrail, setCompletedTrail] = useState<CompletedTrail | null>(null)

  const handleTrailCompleted = (trail: CompletedTrail) => {
    setCompletedTrail(trail)
  }

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center space-x-2">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
                <Mountain className="h-8 w-8 text-green-600" />
                <span className="text-2xl font-bold text-gray-900">VinTrek</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <Mountain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Wallet Required</h2>
            <p className="text-gray-600 mb-6">
              Please connect your Cardano wallet to start recording trails and earning rewards.
            </p>
            <Link
              href="/"
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors inline-block"
            >
              Connect Wallet
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (completedTrail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center space-x-2">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
                <Mountain className="h-8 w-8 text-green-600" />
                <span className="text-2xl font-bold text-gray-900">VinTrek</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Trail Completed */}
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-8 w-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Trail Completed!</h2>
            <h3 className="text-xl text-green-600 font-semibold mb-4">{completedTrail.name}</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900">
                  {(completedTrail.distance / 1000).toFixed(2)} km
                </div>
                <div className="text-sm text-gray-600">Distance</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900">
                  {Math.floor(completedTrail.duration / 60)}m
                </div>
                <div className="text-sm text-gray-600">Duration</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Coins className="h-5 w-5 text-yellow-600" />
                <span className="font-semibold text-gray-900">Rewards Earned</span>
              </div>
              <div className="text-lg text-gray-700">
                🏆 Trail NFT {completedTrail.nftMinted ? '(Minted)' : '(Pending)'} • 🪙 {completedTrail.trekTokensEarned} TREK Tokens (Pending)
              </div>
            </div>

            <p className="text-gray-600 mb-6">
              Your trail has been recorded! NFT minting and token rewards will be processed shortly.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => setCompletedTrail(null)}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Record Another Trail
              </button>
              <Link
                href="/dashboard"
                className="flex-1 border border-green-600 text-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors text-center"
              >
                View Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
              <Mountain className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">VinTrek</span>
            </Link>
            <div className="text-sm text-gray-600">
              Record Trail
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Page Title */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Record Your Trail</h1>
            <p className="text-gray-600">
              Track your hiking adventure and earn blockchain rewards
            </p>
          </div>

          {/* Location Status */}
          <LocationStatus />

          {/* Trail Recorder */}
          <TrailRecorder onTrailCompleted={handleTrailCompleted} />

          {/* Info Cards */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                <span className="font-semibold text-gray-900">NFT Rewards</span>
              </div>
              <p className="text-sm text-gray-600">
                Complete trails to mint unique NFTs with your route data and achievements.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Coins className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-gray-900">TREK Tokens</span>
              </div>
              <p className="text-sm text-gray-600">
                Earn tokens based on distance, difficulty, and completion time.
              </p>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">📱 Recording Tips</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Keep your device charged for longer trails</li>
              <li>• Ensure good GPS signal before starting</li>
              <li>• Pause recording during breaks to save battery</li>
              <li>• Take photos along the way for memories</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
