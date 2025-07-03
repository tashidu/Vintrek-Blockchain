'use client'

import { useState, useCallback } from 'react'
import { TrailRecording, CompletedTrail } from '@/types/trail'
import { TrailCompletionService, TrailCompletionResult } from '@/lib/trailCompletion'
import { useWallet } from '@/components/providers/WalletProvider'
import { useTrailData } from './useTrailData'

interface UseTrailCompletionReturn {
  isProcessing: boolean
  completionResult: TrailCompletionResult | null
  error: string | null
  
  // Trail completion
  verifyCompletion: (recording: TrailRecording) => TrailCompletionResult
  completeTrail: (
    recording: TrailRecording, 
    location?: string,
    notes?: string
  ) => Promise<CompletedTrail | null>
  
  // NFT minting
  mintNFT: (completedTrail: CompletedTrail) => Promise<boolean>
  
  // Reset state
  reset: () => void
}

export function useTrailCompletion(): UseTrailCompletionReturn {
  const { address, authenticated } = useWallet()
  const { saveCompletedTrail } = useTrailData()
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [completionResult, setCompletionResult] = useState<TrailCompletionResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Verify trail completion
  const verifyCompletion = useCallback((recording: TrailRecording): TrailCompletionResult => {
    const result = TrailCompletionService.verifyTrailCompletion(recording)
    setCompletionResult(result)
    return result
  }, [])

  // Complete a trail
  const completeTrail = useCallback(async (
    recording: TrailRecording,
    location: string = 'Unknown Location',
    notes?: string
  ): Promise<CompletedTrail | null> => {
    if (!address) {
      setError('Wallet not connected')
      return null
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Verify completion first
      const result = TrailCompletionService.verifyTrailCompletion(recording)
      setCompletionResult(result)

      if (!result.completed) {
        setError(`Trail not completed: ${result.reasons?.join(', ')}`)
        return null
      }

      // Calculate difficulty based on trail metrics
      const difficulty = TrailCompletionService.calculateDifficulty(
        recording.totalDistance,
        recording.elevationGain,
        recording.totalDuration
      )

      // Create completed trail object
      const completedTrail = TrailCompletionService.createCompletedTrail(
        recording,
        address,
        difficulty,
        location
      )

      // Add notes if provided
      if (notes) {
        completedTrail.notes = notes
      }

      // Save to local storage
      const saved = saveCompletedTrail(completedTrail)
      if (!saved) {
        setError('Failed to save completed trail')
        return null
      }

      return completedTrail
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      return null
    } finally {
      setIsProcessing(false)
    }
  }, [address, saveCompletedTrail])

  // Mint NFT for completed trail
  const mintNFT = useCallback(async (completedTrail: CompletedTrail): Promise<boolean> => {
    if (!address || !authenticated) {
      setError('Wallet not connected or not authenticated')
      return false
    }

    if (completedTrail.nftMinted) {
      setError('NFT already minted for this trail')
      return false
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Check if trail is eligible for NFT
      const verification = TrailCompletionService.verifyTrailCompletion({
        id: completedTrail.id,
        name: completedTrail.name,
        description: completedTrail.description,
        startTime: new Date(Date.now() - completedTrail.duration * 1000).toISOString(),
        endTime: completedTrail.completedAt,
        coordinates: completedTrail.coordinates,
        isActive: false,
        isPaused: false,
        totalDistance: completedTrail.distance,
        totalDuration: completedTrail.duration,
        averageSpeed: completedTrail.distance / completedTrail.duration,
        maxSpeed: 0, // Not available from completed trail
        elevationGain: 0, // Will be calculated
        elevationLoss: 0, // Will be calculated
      })

      if (!verification.nftEligible) {
        setError('Trail does not meet NFT minting requirements')
        return false
      }

      // Attempt to mint NFT
      const mintResult = await TrailCompletionService.mintTrailNFT(completedTrail, address)

      if (mintResult.success) {
        // Update the completed trail with NFT information
        const updatedTrail = {
          ...completedTrail,
          nftMinted: true,
          nftTokenId: mintResult.tokenId
        }

        // Save updated trail
        saveCompletedTrail(updatedTrail)
        
        return true
      } else {
        setError(mintResult.error || 'NFT minting failed')
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'NFT minting failed'
      setError(errorMessage)
      return false
    } finally {
      setIsProcessing(false)
    }
  }, [address, authenticated, saveCompletedTrail])

  // Reset state
  const reset = useCallback(() => {
    setIsProcessing(false)
    setCompletionResult(null)
    setError(null)
  }, [])

  return {
    isProcessing,
    completionResult,
    error,
    verifyCompletion,
    completeTrail,
    mintNFT,
    reset
  }
}
