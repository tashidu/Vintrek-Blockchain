// VinTrek Hybrid Data Service
// Coordinates between blockchain storage and local caching for optimal performance

import { vinTrekBlockchainService, TrailCompletionMetadata, RewardMetadata } from '@/lib/blockchain'
import { localStorageService, CachedUserData } from './localStorageService'
import { CompletedTrail, UserTrailStats } from '@/types/trail'
import { Trail } from '@/types'

export interface SyncResult {
  success: boolean
  blockchainTxHash?: string
  localCacheUpdated: boolean
  error?: string
}

export interface TrailCompletionData {
  trailId: string
  trailName: string
  location: string
  difficulty: 'Easy' | 'Moderate' | 'Hard' | 'Expert'
  distance: number // in meters
  duration: number // in seconds
  gpsPath: Array<{ lat: number; lng: number; timestamp: string }>
  photos?: string[]
  notes?: string
  trekTokensEarned: number
  nftMinted: boolean
  nftTokenId?: string
}

class HybridDataService {
  private syncInProgress = false

  // Complete a trail - stores both locally and on blockchain
  async completeTrail(walletAddress: string, completionData: TrailCompletionData): Promise<SyncResult> {
    if (this.syncInProgress) {
      throw new Error('Sync already in progress')
    }

    this.syncInProgress = true
    await localStorageService.setSyncStatus('syncing')

    try {
      console.log('🔄 Starting trail completion sync...')

      // 1. Store locally first for immediate UI feedback
      const completedTrail: CompletedTrail = {
        id: `${completionData.trailId}_${Date.now()}`,
        name: completionData.trailName,
        description: `Completed ${completionData.trailName} trail`,
        location: completionData.location,
        difficulty: completionData.difficulty,
        completedAt: new Date().toISOString(),
        duration: completionData.duration,
        distance: completionData.distance,
        coordinates: completionData.gpsPath.map(point => ({
          latitude: point.lat,
          longitude: point.lng,
          timestamp: point.timestamp
        })),
        photos: completionData.photos,
        notes: completionData.notes,
        walletAddress,
        nftMinted: completionData.nftMinted,
        nftTokenId: completionData.nftTokenId,
        trekTokensEarned: completionData.trekTokensEarned,
        verified: false // Will be true once blockchain confirms
      }

      await localStorageService.addCompletedTrail(walletAddress, completedTrail)
      console.log('✅ Trail completion cached locally')

      // 2. Store proof on blockchain
      let blockchainTxHash: string | undefined

      try {
        blockchainTxHash = await vinTrekBlockchainService.storeTrailCompletion({
          trailId: completionData.trailId,
          hikerAddress: walletAddress,
          distance: completionData.distance,
          duration: completionData.duration,
          difficulty: completionData.difficulty,
          gpsPath: completionData.gpsPath,
          trekTokensEarned: completionData.trekTokensEarned,
          nftMinted: completionData.nftMinted
        })

        // Update local record with blockchain proof
        completedTrail.verified = true
        await localStorageService.addCompletedTrail(walletAddress, completedTrail)

        console.log('✅ Trail completion stored on blockchain:', blockchainTxHash)
      } catch (blockchainError) {
        console.warn('⚠️ Blockchain storage failed, keeping local copy:', blockchainError)
        // Trail is still saved locally, user can retry blockchain sync later
      }

      // 3. Record TREK token reward
      if (completionData.trekTokensEarned > 0) {
        try {
          await vinTrekBlockchainService.recordTrekReward({
            hikerAddress: walletAddress,
            trailId: completionData.trailId,
            rewardType: 'completion',
            trekAmount: completionData.trekTokensEarned
          })
        } catch (rewardError) {
          console.warn('⚠️ TREK reward recording failed:', rewardError)
        }
      }

      await localStorageService.setSyncStatus('synced')

      return {
        success: true,
        blockchainTxHash,
        localCacheUpdated: true
      }

    } catch (error) {
      console.error('❌ Trail completion sync failed:', error)
      await localStorageService.setSyncStatus('error')

      return {
        success: false,
        localCacheUpdated: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    } finally {
      this.syncInProgress = false
    }
  }

  // VinTrek provides free trail access - no booking system needed
  // Users can access any trail anytime without payment or reservations
  async recordTrailAccess(walletAddress: string, trailId: string): Promise<SyncResult> {
    try {
      console.log('🔄 Recording trail access...')

      // Record trail access for analytics (optional)
      await localStorageService.recordTrailAccess(walletAddress, trailId)
      console.log('✅ Trail access recorded locally')

      return {
        success: true,
        localCacheUpdated: true
      }

    } catch (error) {
      console.error('❌ Trail access recording failed:', error)

      return {
        success: false,
        localCacheUpdated: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Get user's trail history (from cache first, blockchain as backup)
  async getUserTrailHistory(walletAddress: string, forceBlockchainSync = false): Promise<CompletedTrail[]> {
    try {
      // Try local cache first for speed
      if (!forceBlockchainSync) {
        const cachedTrails = await localStorageService.getCompletedTrails(walletAddress)
        if (cachedTrails.length > 0) {
          console.log('📱 Returning cached trail history')
          return cachedTrails
        }
      }

      // Fallback to blockchain query
      console.log('🔍 Querying blockchain for trail history...')
      const blockchainHistory = await vinTrekBlockchainService.getUserTrailHistory(walletAddress)

      // Convert blockchain data to local format and cache it
      const completedTrails: CompletedTrail[] = blockchainHistory.map(metadata => ({
        id: `${metadata.trail_id}_${metadata.completion_timestamp}`,
        name: metadata.trail_id, // Would need trail name lookup
        description: `Trail completed on ${metadata.completion_timestamp}`,
        location: 'Unknown', // Would need trail location lookup
        difficulty: metadata.difficulty as any,
        completedAt: metadata.completion_timestamp,
        duration: metadata.duration_seconds,
        distance: metadata.distance_meters,
        coordinates: metadata.gps_checkpoints.map(point => ({
          latitude: point.lat,
          longitude: point.lng,
          timestamp: point.timestamp
        })),
        walletAddress,
        nftMinted: metadata.nft_minted,
        trekTokensEarned: metadata.trek_tokens_earned,
        verified: true // From blockchain, so verified
      }))

      // Cache the results
      for (const trail of completedTrails) {
        await localStorageService.addCompletedTrail(walletAddress, trail)
      }

      return completedTrails

    } catch (error) {
      console.error('Error getting trail history:', error)
      return []
    }
  }

  // Get user's trail access history
  async getTrailAccessHistory(walletAddress: string): Promise<any[]> {
    try {
      return await localStorageService.getTrailAccessHistory(walletAddress)
    } catch (error) {
      console.error('Error getting trail access history:', error)
      return []
    }
  }

  // Get user statistics (calculated from local cache)
  async getUserStats(walletAddress: string): Promise<UserTrailStats> {
    try {
      const userData = await localStorageService.getUserData(walletAddress)
      return userData?.stats || {
        totalTrails: 0,
        totalDistance: 0,
        totalDuration: 0,
        totalElevationGain: 0,
        trekTokensEarned: 0,
        nftsMinted: 0,
        achievements: []
      }
    } catch (error) {
      console.error('Error getting user stats:', error)
      return {
        totalTrails: 0,
        totalDistance: 0,
        totalDuration: 0,
        totalElevationGain: 0,
        trekTokensEarned: 0,
        nftsMinted: 0,
        achievements: []
      }
    }
  }

  // Sync local data with blockchain (for data recovery)
  async syncWithBlockchain(walletAddress: string): Promise<SyncResult> {
    try {
      console.log('🔄 Syncing with blockchain...')
      await localStorageService.setSyncStatus('syncing')

      // Get fresh data from blockchain
      const blockchainHistory = await vinTrekBlockchainService.getUserTrailHistory(walletAddress)

      // Update local cache
      for (const metadata of blockchainHistory) {
        const completedTrail: CompletedTrail = {
          id: `${metadata.trail_id}_${metadata.completion_timestamp}`,
          name: metadata.trail_id,
          description: `Trail completed on ${metadata.completion_timestamp}`,
          location: 'Unknown',
          difficulty: metadata.difficulty as any,
          completedAt: metadata.completion_timestamp,
          duration: metadata.duration_seconds,
          distance: metadata.distance_meters,
          coordinates: metadata.gps_checkpoints.map(point => ({
            latitude: point.lat,
            longitude: point.lng,
            timestamp: point.timestamp
          })),
          walletAddress,
          nftMinted: metadata.nft_minted,
          trekTokensEarned: metadata.trek_tokens_earned,
          verified: true
        }

        await localStorageService.addCompletedTrail(walletAddress, completedTrail)
      }

      await localStorageService.setSyncStatus('synced')

      return {
        success: true,
        localCacheUpdated: true
      }

    } catch (error) {
      console.error('Blockchain sync failed:', error)
      await localStorageService.setSyncStatus('error')

      return {
        success: false,
        localCacheUpdated: false,
        error: error instanceof Error ? error.message : 'Sync failed'
      }
    }
  }

  // Clear all local data (for wallet disconnect)
  async clearUserData(walletAddress: string): Promise<void> {
    await localStorageService.clearUserData(walletAddress)
  }

  // Get sync status
  async getSyncStatus() {
    return await localStorageService.getSyncStatus()
  }
}

// Export singleton instance
export const hybridDataService = new HybridDataService()
export default hybridDataService
