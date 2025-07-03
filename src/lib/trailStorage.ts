'use client'

import { TrailRecording, CompletedTrail, TrailTemplate, UserTrailStats } from '@/types/trail'

// Storage keys
const STORAGE_KEYS = {
  TRAIL_RECORDINGS: 'vintrek_trail_recordings',
  COMPLETED_TRAILS: 'vintrek_completed_trails',
  USER_STATS: 'vintrek_user_stats',
  TRAIL_TEMPLATES: 'vintrek_trail_templates',
  OFFLINE_DATA: 'vintrek_offline_data',
} as const

// Trail Recording Storage
export class TrailStorage {
  // Save trail recording
  static saveTrailRecording(recording: TrailRecording): boolean {
    try {
      const recordings = this.getTrailRecordings()
      const existingIndex = recordings.findIndex(r => r.id === recording.id)
      
      if (existingIndex >= 0) {
        recordings[existingIndex] = recording
      } else {
        recordings.push(recording)
      }
      
      localStorage.setItem(STORAGE_KEYS.TRAIL_RECORDINGS, JSON.stringify(recordings))
      return true
    } catch (error) {
      console.error('Failed to save trail recording:', error)
      return false
    }
  }

  // Get all trail recordings
  static getTrailRecordings(): TrailRecording[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRAIL_RECORDINGS)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Failed to get trail recordings:', error)
      return []
    }
  }

  // Get trail recording by ID
  static getTrailRecording(id: string): TrailRecording | null {
    const recordings = this.getTrailRecordings()
    return recordings.find(r => r.id === id) || null
  }

  // Delete trail recording
  static deleteTrailRecording(id: string): boolean {
    try {
      const recordings = this.getTrailRecordings()
      const filtered = recordings.filter(r => r.id !== id)
      localStorage.setItem(STORAGE_KEYS.TRAIL_RECORDINGS, JSON.stringify(filtered))
      return true
    } catch (error) {
      console.error('Failed to delete trail recording:', error)
      return false
    }
  }

  // Save completed trail
  static saveCompletedTrail(trail: CompletedTrail): boolean {
    try {
      const trails = this.getCompletedTrails()
      const existingIndex = trails.findIndex(t => t.id === trail.id)
      
      if (existingIndex >= 0) {
        trails[existingIndex] = trail
      } else {
        trails.push(trail)
      }
      
      localStorage.setItem(STORAGE_KEYS.COMPLETED_TRAILS, JSON.stringify(trails))
      this.updateUserStats(trail)
      return true
    } catch (error) {
      console.error('Failed to save completed trail:', error)
      return false
    }
  }

  // Get completed trails
  static getCompletedTrails(walletAddress?: string): CompletedTrail[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMPLETED_TRAILS)
      const trails = data ? JSON.parse(data) : []
      
      if (walletAddress) {
        return trails.filter((t: CompletedTrail) => t.walletAddress === walletAddress)
      }
      
      return trails
    } catch (error) {
      console.error('Failed to get completed trails:', error)
      return []
    }
  }

  // Get completed trail by ID
  static getCompletedTrail(id: string): CompletedTrail | null {
    const trails = this.getCompletedTrails()
    return trails.find(t => t.id === id) || null
  }

  // Update user statistics
  static updateUserStats(completedTrail: CompletedTrail): void {
    try {
      const stats = this.getUserStats(completedTrail.walletAddress)
      
      const updatedStats: UserTrailStats = {
        totalTrails: stats.totalTrails + 1,
        totalDistance: stats.totalDistance + completedTrail.distance,
        totalDuration: stats.totalDuration + completedTrail.duration,
        totalElevationGain: stats.totalElevationGain + (completedTrail.coordinates.reduce((gain, coord, index) => {
          if (index === 0 || !coord.altitude) return gain
          const prevCoord = completedTrail.coordinates[index - 1]
          if (!prevCoord.altitude) return gain
          const diff = coord.altitude - prevCoord.altitude
          return gain + (diff > 0 ? diff : 0)
        }, 0)),
        trekTokensEarned: stats.trekTokensEarned + completedTrail.trekTokensEarned,
        nftsMinted: stats.nftsMinted + (completedTrail.nftMinted ? 1 : 0),
        favoriteTrail: this.getFavoriteTrail(completedTrail.walletAddress),
        longestTrail: this.getLongestTrail(completedTrail.walletAddress),
        achievements: this.calculateAchievements(completedTrail.walletAddress),
      }
      
      localStorage.setItem(
        `${STORAGE_KEYS.USER_STATS}_${completedTrail.walletAddress}`,
        JSON.stringify(updatedStats)
      )
    } catch (error) {
      console.error('Failed to update user stats:', error)
    }
  }

  // Get user statistics
  static getUserStats(walletAddress: string): UserTrailStats {
    try {
      const data = localStorage.getItem(`${STORAGE_KEYS.USER_STATS}_${walletAddress}`)
      return data ? JSON.parse(data) : {
        totalTrails: 0,
        totalDistance: 0,
        totalDuration: 0,
        totalElevationGain: 0,
        trekTokensEarned: 0,
        nftsMinted: 0,
        achievements: [],
      }
    } catch (error) {
      console.error('Failed to get user stats:', error)
      return {
        totalTrails: 0,
        totalDistance: 0,
        totalDuration: 0,
        totalElevationGain: 0,
        trekTokensEarned: 0,
        nftsMinted: 0,
        achievements: [],
      }
    }
  }

  // Get favorite trail (most completed)
  static getFavoriteTrail(walletAddress: string): string | undefined {
    const trails = this.getCompletedTrails(walletAddress)
    const trailCounts = trails.reduce((counts, trail) => {
      counts[trail.name] = (counts[trail.name] || 0) + 1
      return counts
    }, {} as Record<string, number>)
    
    return Object.entries(trailCounts).sort(([,a], [,b]) => b - a)[0]?.[0]
  }

  // Get longest trail
  static getLongestTrail(walletAddress: string): string | undefined {
    const trails = this.getCompletedTrails(walletAddress)
    return trails.sort((a, b) => b.distance - a.distance)[0]?.name
  }

  // Calculate achievements
  static calculateAchievements(walletAddress: string): any[] {
    const trails = this.getCompletedTrails(walletAddress)
    const stats = this.getUserStats(walletAddress)
    const achievements = []

    // Distance achievements
    if (stats.totalDistance >= 100000) achievements.push({ id: 'distance_100k', name: '100km Explorer', category: 'distance' })
    if (stats.totalDistance >= 50000) achievements.push({ id: 'distance_50k', name: '50km Adventurer', category: 'distance' })
    if (stats.totalDistance >= 10000) achievements.push({ id: 'distance_10k', name: '10km Hiker', category: 'distance' })

    // Trail count achievements
    if (stats.totalTrails >= 50) achievements.push({ id: 'trails_50', name: 'Trail Master', category: 'trails' })
    if (stats.totalTrails >= 20) achievements.push({ id: 'trails_20', name: 'Trail Enthusiast', category: 'trails' })
    if (stats.totalTrails >= 5) achievements.push({ id: 'trails_5', name: 'Trail Explorer', category: 'trails' })

    // Special achievements
    if (trails.some(t => t.difficulty === 'Expert')) achievements.push({ id: 'expert_trail', name: 'Expert Climber', category: 'special' })
    if (stats.nftsMinted >= 10) achievements.push({ id: 'nft_collector', name: 'NFT Collector', category: 'special' })

    return achievements
  }

  // Export trail data
  static exportTrailData(walletAddress: string): string {
    const data = {
      recordings: this.getTrailRecordings(),
      completedTrails: this.getCompletedTrails(walletAddress),
      stats: this.getUserStats(walletAddress),
      exportedAt: new Date().toISOString(),
    }
    
    return JSON.stringify(data, null, 2)
  }

  // Import trail data
  static importTrailData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData)
      
      if (data.recordings) {
        localStorage.setItem(STORAGE_KEYS.TRAIL_RECORDINGS, JSON.stringify(data.recordings))
      }
      
      if (data.completedTrails) {
        localStorage.setItem(STORAGE_KEYS.COMPLETED_TRAILS, JSON.stringify(data.completedTrails))
      }
      
      return true
    } catch (error) {
      console.error('Failed to import trail data:', error)
      return false
    }
  }

  // Clear all data
  static clearAllData(): boolean {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key)
      })
      
      // Clear user-specific stats
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith(STORAGE_KEYS.USER_STATS)) {
          localStorage.removeItem(key)
        }
      }
      
      return true
    } catch (error) {
      console.error('Failed to clear data:', error)
      return false
    }
  }

  // Get storage usage
  static getStorageUsage(): { used: number; total: number; percentage: number } {
    try {
      let used = 0
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('vintrek_')) {
          used += localStorage.getItem(key)?.length || 0
        }
      }
      
      // Estimate total available (usually 5-10MB)
      const total = 5 * 1024 * 1024 // 5MB estimate
      const percentage = (used / total) * 100
      
      return { used, total, percentage }
    } catch (error) {
      console.error('Failed to get storage usage:', error)
      return { used: 0, total: 0, percentage: 0 }
    }
  }
}
