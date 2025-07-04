// VinTrek Local Storage Service
// Handles fast caching of user data, preferences, and trail information

import { CompletedTrail, UserTrailStats, Achievement } from '@/types/trail'
import { Trail } from '@/types'

export interface CachedUserData {
  walletAddress: string
  completedTrails: CompletedTrail[]
  stats: UserTrailStats
  preferences: UserPreferences
  lastSyncTimestamp: number
}

export interface UserPreferences {
  preferredUnits: 'metric' | 'imperial'
  mapStyle: 'satellite' | 'terrain' | 'street'
  notifications: {
    trailReminders: boolean
    achievements: boolean
    tokenRewards: boolean
  }
  privacy: {
    shareStats: boolean
    showOnLeaderboard: boolean
  }
}

export interface CachedTrailData {
  trails: Trail[]
  lastUpdated: number
  userContributed: Trail[]
}

export interface LeaderboardData {
  topHikers: Array<{
    walletAddress: string
    totalDistance: number
    totalTrails: number
    trekTokens: number
    rank: number
  }>
  lastUpdated: number
}

class LocalStorageService {
  private readonly STORAGE_KEYS = {
    USER_DATA: 'vintrek_user_data',
    TRAIL_DATA: 'vintrek_trail_data',
    LEADERBOARD: 'vintrek_leaderboard',
    APP_SETTINGS: 'vintrek_app_settings',
    SYNC_STATUS: 'vintrek_sync_status'
  }

  private readonly CACHE_DURATION = {
    USER_DATA: 5 * 60 * 1000, // 5 minutes
    TRAIL_DATA: 30 * 60 * 1000, // 30 minutes
    LEADERBOARD: 10 * 60 * 1000 // 10 minutes
  }

  // User Data Management
  async getUserData(walletAddress: string): Promise<CachedUserData | null> {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.USER_DATA)
      if (!data) return null

      const userData: CachedUserData = JSON.parse(data)
      
      // Check if data is for the correct wallet and not expired
      if (userData.walletAddress !== walletAddress) return null
      if (this.isExpired(userData.lastSyncTimestamp, this.CACHE_DURATION.USER_DATA)) {
        return null
      }

      return userData
    } catch (error) {
      console.error('Error reading user data from localStorage:', error)
      return null
    }
  }

  async saveUserData(userData: CachedUserData): Promise<void> {
    try {
      userData.lastSyncTimestamp = Date.now()
      localStorage.setItem(this.STORAGE_KEYS.USER_DATA, JSON.stringify(userData))
    } catch (error) {
      console.error('Error saving user data to localStorage:', error)
      throw error
    }
  }

  // Trail Completion Management
  async addCompletedTrail(walletAddress: string, trail: CompletedTrail): Promise<void> {
    const userData = await this.getUserData(walletAddress) || this.createEmptyUserData(walletAddress)
    
    // Check if trail already exists
    const existingIndex = userData.completedTrails.findIndex(t => t.id === trail.id)
    if (existingIndex >= 0) {
      userData.completedTrails[existingIndex] = trail
    } else {
      userData.completedTrails.push(trail)
    }

    // Update stats
    userData.stats = this.calculateStats(userData.completedTrails)
    
    await this.saveUserData(userData)
  }

  async getCompletedTrails(walletAddress: string): Promise<CompletedTrail[]> {
    const userData = await this.getUserData(walletAddress)
    return userData?.completedTrails || []
  }

  // Trail Data Caching
  async getCachedTrails(): Promise<Trail[]> {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.TRAIL_DATA)
      if (!data) return []

      const trailData: CachedTrailData = JSON.parse(data)
      
      if (this.isExpired(trailData.lastUpdated, this.CACHE_DURATION.TRAIL_DATA)) {
        return []
      }

      return trailData.trails
    } catch (error) {
      console.error('Error reading trail data from localStorage:', error)
      return []
    }
  }

  async cacheTrails(trails: Trail[]): Promise<void> {
    try {
      const trailData: CachedTrailData = {
        trails,
        lastUpdated: Date.now(),
        userContributed: trails.filter(t => t.isUserContributed)
      }
      localStorage.setItem(this.STORAGE_KEYS.TRAIL_DATA, JSON.stringify(trailData))
    } catch (error) {
      console.error('Error caching trail data:', error)
    }
  }

  // Trail Access Tracking (Free Access - No Bookings Required)
  async recordTrailAccess(walletAddress: string, trailId: string): Promise<void> {
    try {
      const accessKey = `trail_access_${walletAddress}_${trailId}_${Date.now()}`
      const accessData = {
        trailId,
        walletAddress,
        accessedAt: new Date().toISOString(),
        sessionId: `session_${Date.now()}`
      }

      // Store trail access for analytics (optional)
      localStorage.setItem(accessKey, JSON.stringify(accessData))
    } catch (error) {
      console.error('Error recording trail access:', error)
    }
  }

  async getTrailAccessHistory(walletAddress: string): Promise<any[]> {
    try {
      const accessHistory = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith(`trail_access_${walletAddress}_`)) {
          const data = localStorage.getItem(key)
          if (data) {
            accessHistory.push(JSON.parse(data))
          }
        }
      }
      return accessHistory.sort((a, b) => new Date(b.accessedAt).getTime() - new Date(a.accessedAt).getTime())
    } catch (error) {
      console.error('Error getting trail access history:', error)
      return []
    }
  }

  // Leaderboard Caching
  async getCachedLeaderboard(): Promise<LeaderboardData | null> {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.LEADERBOARD)
      if (!data) return null

      const leaderboard: LeaderboardData = JSON.parse(data)
      
      if (this.isExpired(leaderboard.lastUpdated, this.CACHE_DURATION.LEADERBOARD)) {
        return null
      }

      return leaderboard
    } catch (error) {
      console.error('Error reading leaderboard from localStorage:', error)
      return null
    }
  }

  async cacheLeaderboard(leaderboard: Omit<LeaderboardData, 'lastUpdated'>): Promise<void> {
    try {
      const data: LeaderboardData = {
        ...leaderboard,
        lastUpdated: Date.now()
      }
      localStorage.setItem(this.STORAGE_KEYS.LEADERBOARD, JSON.stringify(data))
    } catch (error) {
      console.error('Error caching leaderboard:', error)
    }
  }

  // User Preferences
  async getUserPreferences(walletAddress: string): Promise<UserPreferences> {
    const userData = await this.getUserData(walletAddress)
    return userData?.preferences || this.getDefaultPreferences()
  }

  async updateUserPreferences(walletAddress: string, preferences: Partial<UserPreferences>): Promise<void> {
    const userData = await this.getUserData(walletAddress) || this.createEmptyUserData(walletAddress)
    userData.preferences = { ...userData.preferences, ...preferences }
    await this.saveUserData(userData)
  }

  // Utility Methods
  private isExpired(timestamp: number, duration: number): boolean {
    return Date.now() - timestamp > duration
  }

  private createEmptyUserData(walletAddress: string): CachedUserData {
    return {
      walletAddress,
      completedTrails: [],

      stats: {
        totalTrails: 0,
        totalDistance: 0,
        totalDuration: 0,
        totalElevationGain: 0,
        trekTokensEarned: 0,
        nftsMinted: 0,
        achievements: []
      },
      preferences: this.getDefaultPreferences(),
      lastSyncTimestamp: Date.now()
    }
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      preferredUnits: 'metric',
      mapStyle: 'terrain',
      notifications: {
        trailReminders: true,
        achievements: true,
        tokenRewards: true
      },
      privacy: {
        shareStats: true,
        showOnLeaderboard: true
      }
    }
  }

  private calculateStats(completedTrails: CompletedTrail[]): UserTrailStats {
    const stats: UserTrailStats = {
      totalTrails: completedTrails.length,
      totalDistance: completedTrails.reduce((sum, trail) => sum + trail.distance, 0),
      totalDuration: completedTrails.reduce((sum, trail) => sum + trail.duration, 0),
      totalElevationGain: 0, // Would need elevation data
      trekTokensEarned: completedTrails.reduce((sum, trail) => sum + trail.trekTokensEarned, 0),
      nftsMinted: completedTrails.filter(trail => trail.nftMinted).length,
      achievements: []
    }

    // Find favorite trail (most completed difficulty)
    const difficultyCount = completedTrails.reduce((acc, trail) => {
      acc[trail.difficulty] = (acc[trail.difficulty] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const favoriteDifficulty = Object.entries(difficultyCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0]

    if (favoriteDifficulty) {
      stats.favoriteTrail = favoriteDifficulty
    }

    // Find longest trail
    const longestTrail = completedTrails.reduce((longest, trail) => 
      trail.distance > longest.distance ? trail : longest, 
      completedTrails[0]
    )

    if (longestTrail) {
      stats.longestTrail = longestTrail.name
    }

    return stats
  }

  // Clear cache methods
  async clearUserData(walletAddress?: string): Promise<void> {
    if (walletAddress) {
      const userData = await this.getUserData(walletAddress)
      if (userData) {
        localStorage.removeItem(this.STORAGE_KEYS.USER_DATA)
      }
    } else {
      localStorage.removeItem(this.STORAGE_KEYS.USER_DATA)
    }
  }

  async clearAllCache(): Promise<void> {
    Object.values(this.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
  }

  // Sync status tracking
  async setSyncStatus(status: 'syncing' | 'synced' | 'error', lastSync?: number): Promise<void> {
    const syncData = {
      status,
      lastSync: lastSync || Date.now(),
      timestamp: Date.now()
    }
    localStorage.setItem(this.STORAGE_KEYS.SYNC_STATUS, JSON.stringify(syncData))
  }

  async getSyncStatus(): Promise<{ status: string; lastSync: number; timestamp: number } | null> {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.SYNC_STATUS)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Error reading sync status:', error)
      return null
    }
  }
}

// Export singleton instance
export const localStorageService = new LocalStorageService()
export default localStorageService
