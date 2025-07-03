'use client'

import { useState } from 'react'
import { MapPin, Trophy, Coins, Camera, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { useWallet } from '@/components/providers/WalletProvider'
import { blockchainService } from '@/lib/blockchain'
import { Trail } from '@/types'

interface TrailCompletionProps {
  trail: Trail
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

interface CompletionData {
  completionPhoto?: File
  gpsCoordinates: string
  completionNotes: string
  difficulty: string
}

export function TrailCompletion({ trail, isOpen, onClose, onComplete }: TrailCompletionProps) {
  const { connected, wallet, address } = useWallet()
  const [step, setStep] = useState(1) // 1: Verify, 2: Mint NFT, 3: Success
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [completionData, setCompletionData] = useState<CompletionData>({
    gpsCoordinates: '',
    completionNotes: '',
    difficulty: trail.difficulty
  })
  const [nftTxHash, setNftTxHash] = useState('')
  const [tokenTxHash, setTokenTxHash] = useState('')

  if (!isOpen) return null

  const handleLocationCapture = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = `${position.coords.latitude}, ${position.coords.longitude}`
          setCompletionData(prev => ({ ...prev, gpsCoordinates: coords }))
        },
        (error) => {
          console.error('Error getting location:', error)
          setError('Unable to get your location. Please enter coordinates manually.')
        }
      )
    } else {
      setError('Geolocation is not supported by this browser.')
    }
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setCompletionData(prev => ({ ...prev, completionPhoto: file }))
    }
  }

  const handleVerifyCompletion = () => {
    if (!completionData.gpsCoordinates) {
      setError('Please capture your location or enter GPS coordinates.')
      return
    }
    
    if (!completionData.completionNotes.trim()) {
      setError('Please add some notes about your trail experience.')
      return
    }

    setError('')
    setStep(2)
  }

  const handleMintNFT = async () => {
    if (!connected || !wallet) {
      setError('Please connect your wallet to mint your trail NFT.')
      return
    }

    setIsProcessing(true)
    setError('')

    try {
      blockchainService.setWallet(wallet)

      // Mint trail completion NFT
      const nftHash = await blockchainService.mintTrailNFT({
        trailName: trail.name,
        location: trail.location,
        difficulty: trail.difficulty,
        coordinates: completionData.gpsCoordinates
      })

      setNftTxHash(nftHash)

      // Mint TREK token rewards
      const rewardAmount = getRewardAmount(trail.difficulty)
      const tokenHash = await blockchainService.mintTrekTokens(
        rewardAmount,
        `Trail completion: ${trail.name}`
      )

      setTokenTxHash(tokenHash)
      setStep(3)
      
      // Call completion callback
      onComplete()
    } catch (error) {
      console.error('Error minting NFT:', error)
      setError('Failed to mint NFT. Please try again or check your wallet.')
    } finally {
      setIsProcessing(false)
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-100'
      case 'moderate': return 'text-yellow-600 bg-yellow-100'
      case 'hard': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Complete Your Trail</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                {step > 1 ? <CheckCircle className="h-5 w-5" /> : '1'}
              </div>
              <span className="font-medium">Verify Completion</span>
            </div>
            <div className="flex-1 h-px bg-gray-200"></div>
            <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                {step > 2 ? <CheckCircle className="h-5 w-5" /> : '2'}
              </div>
              <span className="font-medium">Mint NFT</span>
            </div>
            <div className="flex-1 h-px bg-gray-200"></div>
            <div className={`flex items-center space-x-2 ${step >= 3 ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                {step >= 3 ? <CheckCircle className="h-5 w-5" /> : '3'}
              </div>
              <span className="font-medium">Success</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Trail Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{trail.name}</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {trail.location}
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(trail.difficulty)}`}>
                {trail.difficulty}
              </span>
            </div>
          </div>

          {/* Step 1: Verify Completion */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Verify Your Trail Completion</h4>
                
                {/* GPS Location */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GPS Location
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={completionData.gpsCoordinates}
                      onChange={(e) => setCompletionData(prev => ({ ...prev, gpsCoordinates: e.target.value }))}
                      placeholder="Latitude, Longitude"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={handleLocationCapture}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <MapPin className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Completion Photo */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Completion Photo (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label htmlFor="photo-upload" className="cursor-pointer">
                      <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        {completionData.completionPhoto ? completionData.completionPhoto.name : 'Click to upload a photo'}
                      </p>
                    </label>
                  </div>
                </div>

                {/* Completion Notes */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trail Experience Notes
                  </label>
                  <textarea
                    value={completionData.completionNotes}
                    onChange={(e) => setCompletionData(prev => ({ ...prev, completionNotes: e.target.value }))}
                    placeholder="Share your experience, challenges, highlights..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 rounded-lg flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-red-700">{error}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleVerifyCompletion}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Verify Completion
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Mint NFT */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Mint Your Trail NFT</h4>
                <p className="text-gray-600 mb-6">
                  Create a unique blockchain certificate of your trail completion and earn TREK tokens!
                </p>
              </div>

              {/* Rewards Preview */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <Trophy className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="font-semibold text-green-800">Trail NFT</div>
                  <div className="text-sm text-green-600">Unique Certificate</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                  <Coins className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <div className="font-semibold text-yellow-800">{getRewardAmount(trail.difficulty)} TREK</div>
                  <div className="text-sm text-yellow-600">Token Reward</div>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 rounded-lg flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <span className="text-red-700">{error}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleMintNFT}
                disabled={isProcessing || !connected}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  isProcessing || !connected
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center">
                    <Loader className="h-5 w-5 animate-spin mr-2" />
                    Minting NFT...
                  </div>
                ) : (
                  'Mint Trail NFT & Earn Rewards'
                )}
              </button>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="text-center space-y-6">
              <div>
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h4 className="text-2xl font-bold text-gray-900 mb-2">Congratulations!</h4>
                <p className="text-gray-600">
                  You've successfully completed {trail.name} and minted your trail NFT!
                </p>
              </div>

              {/* Transaction Details */}
              <div className="bg-gray-50 p-4 rounded-lg text-left">
                <h5 className="font-medium text-gray-900 mb-3">Transaction Details</h5>
                {nftTxHash && (
                  <div className="mb-2">
                    <span className="text-sm text-gray-600">NFT Transaction: </span>
                    <a
                      href={`https://cardanoscan.io/transaction/${nftTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm font-mono"
                    >
                      {nftTxHash.slice(0, 16)}...
                    </a>
                  </div>
                )}
                {tokenTxHash && (
                  <div>
                    <span className="text-sm text-gray-600">Token Reward: </span>
                    <a
                      href={`https://cardanoscan.io/transaction/${tokenTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm font-mono"
                    >
                      {tokenTxHash.slice(0, 16)}...
                    </a>
                  </div>
                )}
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => window.location.href = '/dashboard'}
                  className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  View Dashboard
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
