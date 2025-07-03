'use client'

import { TrailRecording, CompletedTrail, GPSCoordinate } from '@/types/trail'
import { useWallet } from '@/components/providers/WalletProvider'
import { 
  calculateTotalDistance, 
  calculateElevationGain, 
  generateTrailId,
  formatDistance 
} from './trailUtils'

// Trail completion criteria
export interface TrailCompletionCriteria {
  minimumDistance: number // in meters
  minimumDuration: number // in seconds
  requiredCheckpoints?: GPSCoordinate[]
  allowedDeviation?: number // in meters from predefined route
}

// Trail completion result
export interface TrailCompletionResult {
  completed: boolean
  distance: number
  duration: number
  elevationGain: number
  trekTokensEarned: number
  nftEligible: boolean
  completionPercentage: number
  reasons?: string[]
}

// NFT metadata structure
export interface TrailNFTMetadata {
  name: string
  description: string
  image: string
  attributes: Array<{
    trait_type: string
    value: string | number
  }>
  properties: {
    trail_id: string
    completion_date: string
    distance_km: number
    duration_hours: number
    elevation_gain_m: number
    coordinates_hash: string
    wallet_address: string
  }
}

export class TrailCompletionService {
  /**
   * Verify if a trail recording meets completion criteria
   */
  static verifyTrailCompletion(
    recording: TrailRecording,
    criteria?: TrailCompletionCriteria
  ): TrailCompletionResult {
    const defaultCriteria: TrailCompletionCriteria = {
      minimumDistance: 500, // 500 meters minimum
      minimumDuration: 300, // 5 minutes minimum
    }

    const activeCriteria = { ...defaultCriteria, ...criteria }
    const reasons: string[] = []
    let completed = true

    // Check minimum distance
    if (recording.totalDistance < activeCriteria.minimumDistance) {
      completed = false
      reasons.push(`Minimum distance not met (${formatDistance(recording.totalDistance)} < ${formatDistance(activeCriteria.minimumDistance)})`)
    }

    // Check minimum duration
    if (recording.totalDuration < activeCriteria.minimumDuration) {
      completed = false
      reasons.push(`Minimum duration not met (${Math.floor(recording.totalDuration / 60)}min < ${Math.floor(activeCriteria.minimumDuration / 60)}min)`)
    }

    // Check if recording is actually finished
    if (recording.isActive) {
      completed = false
      reasons.push('Trail recording is still active')
    }

    // Check if there are enough GPS points
    if (recording.coordinates.length < 10) {
      completed = false
      reasons.push('Insufficient GPS tracking data')
    }

    // Calculate completion percentage
    const distancePercentage = Math.min(100, (recording.totalDistance / activeCriteria.minimumDistance) * 100)
    const durationPercentage = Math.min(100, (recording.totalDuration / activeCriteria.minimumDuration) * 100)
    const completionPercentage = Math.min(distancePercentage, durationPercentage)

    // Calculate TREK tokens earned (base formula)
    const baseTokens = 10
    const distanceBonus = Math.floor(recording.totalDistance / 1000) * 5 // 5 tokens per km
    const elevationBonus = Math.floor(recording.elevationGain / 100) * 2 // 2 tokens per 100m elevation
    const trekTokensEarned = completed ? baseTokens + distanceBonus + elevationBonus : 0

    // NFT eligibility (must complete trail and meet certain thresholds)
    const nftEligible = completed && 
      recording.totalDistance >= 1000 && // At least 1km
      recording.totalDuration >= 600 // At least 10 minutes

    return {
      completed,
      distance: recording.totalDistance,
      duration: recording.totalDuration,
      elevationGain: recording.elevationGain,
      trekTokensEarned,
      nftEligible,
      completionPercentage,
      reasons: reasons.length > 0 ? reasons : undefined
    }
  }

  /**
   * Convert a completed trail recording to a CompletedTrail object
   */
  static createCompletedTrail(
    recording: TrailRecording,
    walletAddress: string,
    difficulty: 'Easy' | 'Moderate' | 'Hard' | 'Expert' = 'Easy',
    location: string = 'Unknown Location'
  ): CompletedTrail {
    const completionResult = this.verifyTrailCompletion(recording)

    return {
      id: generateTrailId(),
      name: recording.name,
      description: recording.description,
      location,
      difficulty,
      completedAt: new Date().toISOString(),
      duration: recording.totalDuration,
      distance: recording.totalDistance,
      coordinates: recording.coordinates,
      walletAddress,
      nftMinted: false, // Will be updated after minting
      trekTokensEarned: completionResult.trekTokensEarned,
      verified: completionResult.completed
    }
  }

  /**
   * Generate NFT metadata for a completed trail
   */
  static generateNFTMetadata(
    completedTrail: CompletedTrail,
    imageUrl?: string
  ): TrailNFTMetadata {
    const coordinatesHash = this.hashCoordinates(completedTrail.coordinates)
    
    return {
      name: `VinTrek Trail: ${completedTrail.name}`,
      description: `A blockchain certificate commemorating the completion of ${completedTrail.name} trail. Distance: ${formatDistance(completedTrail.distance)}, Duration: ${Math.floor(completedTrail.duration / 60)} minutes.`,
      image: imageUrl || this.generateTrailImage(completedTrail),
      attributes: [
        {
          trait_type: "Trail Name",
          value: completedTrail.name
        },
        {
          trait_type: "Location",
          value: completedTrail.location
        },
        {
          trait_type: "Difficulty",
          value: completedTrail.difficulty
        },
        {
          trait_type: "Distance (km)",
          value: Number((completedTrail.distance / 1000).toFixed(2))
        },
        {
          trait_type: "Duration (minutes)",
          value: Math.floor(completedTrail.duration / 60)
        },
        {
          trait_type: "Elevation Gain (m)",
          value: Math.floor(calculateElevationGain(completedTrail.coordinates))
        },
        {
          trait_type: "Completion Date",
          value: new Date(completedTrail.completedAt).toLocaleDateString()
        },
        {
          trait_type: "TREK Tokens Earned",
          value: completedTrail.trekTokensEarned
        }
      ],
      properties: {
        trail_id: completedTrail.id,
        completion_date: completedTrail.completedAt,
        distance_km: completedTrail.distance / 1000,
        duration_hours: completedTrail.duration / 3600,
        elevation_gain_m: calculateElevationGain(completedTrail.coordinates),
        coordinates_hash: coordinatesHash,
        wallet_address: completedTrail.walletAddress
      }
    }
  }

  /**
   * Create a simple hash of coordinates for verification
   */
  private static hashCoordinates(coordinates: GPSCoordinate[]): string {
    const coordString = coordinates
      .map(coord => `${coord.latitude.toFixed(6)},${coord.longitude.toFixed(6)}`)
      .join('|')
    
    // Simple hash function (in production, use a proper crypto hash)
    let hash = 0
    for (let i = 0; i < coordString.length; i++) {
      const char = coordString.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16)
  }

  /**
   * Generate a placeholder image URL for the trail NFT
   */
  private static generateTrailImage(completedTrail: CompletedTrail): string {
    // In production, this would generate or fetch an actual image
    // For now, return a placeholder that could be generated server-side
    const params = new URLSearchParams({
      name: completedTrail.name,
      distance: (completedTrail.distance / 1000).toFixed(1),
      difficulty: completedTrail.difficulty,
      date: new Date(completedTrail.completedAt).toLocaleDateString()
    })
    
    return `https://api.vintrek.com/nft-image?${params.toString()}`
  }

  /**
   * Simulate NFT minting process (in production, this would call the smart contract)
   */
  static async mintTrailNFT(
    completedTrail: CompletedTrail,
    walletAddress: string
  ): Promise<{ success: boolean; tokenId?: string; txHash?: string; error?: string }> {
    try {
      // Verify the trail is eligible for NFT minting
      const metadata = this.generateNFTMetadata(completedTrail)
      
      // In production, this would:
      // 1. Call the Aiken smart contract
      // 2. Submit the transaction to Cardano
      // 3. Wait for confirmation
      // 4. Return the token ID and transaction hash
      
      // For now, simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate network delay
      
      // Simulate success/failure (90% success rate)
      const success = Math.random() > 0.1
      
      if (success) {
        const tokenId = `vintrek_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const txHash = `tx_${Math.random().toString(36).substr(2, 16)}`
        
        return {
          success: true,
          tokenId,
          txHash
        }
      } else {
        return {
          success: false,
          error: 'Transaction failed - insufficient funds or network error'
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Calculate difficulty based on trail metrics
   */
  static calculateDifficulty(
    distance: number, // in meters
    elevationGain: number, // in meters
    duration: number // in seconds
  ): 'Easy' | 'Moderate' | 'Hard' | 'Expert' {
    const distanceKm = distance / 1000
    const durationHours = duration / 3600
    
    // Simple difficulty calculation
    let score = 0
    
    // Distance factor
    if (distanceKm > 20) score += 3
    else if (distanceKm > 10) score += 2
    else if (distanceKm > 5) score += 1
    
    // Elevation factor
    if (elevationGain > 1000) score += 3
    else if (elevationGain > 500) score += 2
    else if (elevationGain > 200) score += 1
    
    // Pace factor (slower pace might indicate difficulty)
    const pace = distanceKm / durationHours // km/h
    if (pace < 2) score += 2
    else if (pace < 3) score += 1
    
    if (score >= 6) return 'Expert'
    if (score >= 4) return 'Hard'
    if (score >= 2) return 'Moderate'
    return 'Easy'
  }
}
