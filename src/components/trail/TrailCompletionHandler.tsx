'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useWallet } from '@/components/providers/WalletProvider'
import { hybridDataService, TrailCompletionData } from '@/services/hybridDataService'
import { 
  CheckCircle, 
  Database, 
  Blockchain, 
  Coins, 
  Shield, 
  MapPin, 
  Clock, 
  Route,
  AlertCircle,
  Loader2
} from 'lucide-react'

interface TrailCompletionHandlerProps {
  trailId: string
  trailName: string
  location: string
  difficulty: 'Easy' | 'Moderate' | 'Hard' | 'Expert'
  gpsData: Array<{ lat: number; lng: number; timestamp: string }>
  distance: number // in meters
  duration: number // in seconds
  onComplete?: () => void
}

export default function TrailCompletionHandler({
  trailId,
  trailName,
  location,
  difficulty,
  gpsData,
  distance,
  duration,
  onComplete
}: TrailCompletionHandlerProps) {
  const { address, connected } = useWallet()
  const [completionState, setCompletionState] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('')
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // Calculate TREK tokens based on trail difficulty and distance
  const calculateTrekReward = () => {
    const baseReward = 10
    const difficultyMultiplier = {
      'Easy': 1,
      'Moderate': 1.5,
      'Hard': 2,
      'Expert': 3
    }
    const distanceBonus = Math.floor(distance / 1000) * 5 // 5 TREK per km
    
    return Math.floor(baseReward * difficultyMultiplier[difficulty] + distanceBonus)
  }

  const handleCompleteTrail = async () => {
    if (!connected || !address) {
      setError('Please connect your wallet first')
      return
    }

    if (gpsData.length < 10) {
      setError('Insufficient GPS data for verification')
      return
    }

    setCompletionState('processing')
    setError(null)
    setProgress(0)

    try {
      // Step 1: Prepare completion data
      setCurrentStep('Preparing trail completion data...')
      setProgress(20)

      const trekTokensEarned = calculateTrekReward()
      const shouldMintNFT = distance > 5000 || difficulty === 'Hard' || difficulty === 'Expert'

      const completionData: TrailCompletionData = {
        trailId,
        trailName,
        location,
        difficulty,
        distance,
        duration,
        gpsPath: gpsData,
        trekTokensEarned,
        nftMinted: shouldMintNFT,
        nftTokenId: shouldMintNFT ? `VinTrek_${trailId}_${Date.now()}` : undefined,
        notes: `Completed ${trailName} on ${new Date().toLocaleDateString()}`
      }

      // Step 2: Store locally first (fast UI feedback)
      setCurrentStep('Saving to local cache...')
      setProgress(40)
      await new Promise(resolve => setTimeout(resolve, 500)) // Simulate processing

      // Step 3: Store on blockchain
      setCurrentStep('Storing proof on Cardano blockchain...')
      setProgress(60)

      const syncResult = await hybridDataService.completeTrail(address, completionData)

      // Step 4: Finalize
      setCurrentStep('Finalizing completion...')
      setProgress(80)

      if (syncResult.success) {
        setProgress(100)
        setCurrentStep('Trail completion successful!')
        setResult(syncResult)
        setCompletionState('completed')
        
        // Call completion callback
        onComplete?.()
      } else {
        throw new Error(syncResult.error || 'Failed to complete trail')
      }

    } catch (err) {
      console.error('Trail completion failed:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      setCompletionState('error')
    }
  }

  const formatDistance = (meters: number) => {
    return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${meters} m`
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  }

  if (!connected) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please connect your Cardano wallet to complete this trail.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Complete Trail: {trailName}
        </CardTitle>
        <CardDescription>
          Store your achievement on Cardano blockchain with hybrid architecture
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Trail Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{formatDistance(distance)}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Route className="h-3 w-3" />
              Distance
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{formatDuration(duration)}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Clock className="h-3 w-3" />
              Duration
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{calculateTrekReward()}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Coins className="h-3 w-3" />
              TREK Tokens
            </div>
          </div>
          <div className="text-center">
            <Badge variant={difficulty === 'Easy' ? 'secondary' : difficulty === 'Moderate' ? 'default' : 'destructive'}>
              {difficulty}
            </Badge>
            <div className="text-sm text-muted-foreground mt-1">Difficulty</div>
          </div>
        </div>

        {/* Rewards Preview */}
        <div className="p-4 bg-muted rounded-lg space-y-3">
          <h3 className="font-semibold">Completion Rewards</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Coins className="h-4 w-4" />
                TREK Tokens
              </span>
              <Badge variant="secondary">{calculateTrekReward()} TREK</Badge>
            </div>
            {(distance > 5000 || difficulty === 'Hard' || difficulty === 'Expert') && (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Trail NFT
                </span>
                <Badge variant="default">Will be minted</Badge>
              </div>
            )}
          </div>
        </div>

        {/* Hybrid Architecture Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Database className="h-4 w-4 text-blue-500" />
              <span className="font-medium">Local Storage</span>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Full GPS route data</li>
              <li>• Photos and notes</li>
              <li>• Instant UI updates</li>
              <li>• Offline access</li>
            </ul>
          </div>
          <div className="p-3 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Blockchain className="h-4 w-4 text-purple-500" />
              <span className="font-medium">Cardano Blockchain</span>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Completion proof</li>
              <li>• TREK token rewards</li>
              <li>• NFT minting</li>
              <li>• Immutable verification</li>
            </ul>
          </div>
        </div>

        {/* Processing State */}
        {completionState === 'processing' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">{currentStep}</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {/* Success State */}
        {completionState === 'completed' && result && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p>Trail completion successful!</p>
                {result.blockchainTxHash && (
                  <div className="flex items-center gap-2 text-sm">
                    <Blockchain className="h-3 w-3" />
                    <span>Blockchain TX: </span>
                    <code className="bg-muted px-1 rounded text-xs">
                      {result.blockchainTxHash.substring(0, 16)}...
                    </code>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Database className="h-3 w-3" />
                  <span>Local cache updated</span>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Action Button */}
        <Button 
          onClick={handleCompleteTrail}
          disabled={completionState === 'processing' || completionState === 'completed'}
          className="w-full"
          size="lg"
        >
          {completionState === 'processing' ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Processing...
            </>
          ) : completionState === 'completed' ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Completed
            </>
          ) : (
            <>
              <Blockchain className="h-4 w-4 mr-2" />
              Complete Trail & Store on Blockchain
            </>
          )}
        </Button>

        {/* GPS Data Info */}
        <div className="text-xs text-muted-foreground text-center">
          GPS Points: {gpsData.length} | 
          Verification Score: {gpsData.length >= 100 ? 95 : gpsData.length >= 50 ? 80 : 60}% |
          Wallet: {address?.substring(0, 8)}...{address?.substring(-6)}
        </div>
      </CardContent>
    </Card>
  )
}
