'use client'

import { useState, useEffect, useCallback } from 'react'
import { TrailRecording, CompletedTrail, UserTrailStats } from '@/types/trail'
import { TrailStorage } from '@/lib/trailStorage'
import { useWallet } from '@/components/providers/WalletProvider'

interface UseTrailDataReturn {
  // Trail recordings
  recordings: TrailRecording[]
  saveRecording: (recording: TrailRecording) => boolean
  deleteRecording: (id: string) => boolean
  getRecording: (id: string) => TrailRecording | null
  
  // Completed trails
  completedTrails: CompletedTrail[]
  saveCompletedTrail: (trail: CompletedTrail) => boolean
  getCompletedTrail: (id: string) => CompletedTrail | null
  
  // User statistics
  userStats: UserTrailStats
  refreshStats: () => void
  
  // Data management
  exportData: () => string
  importData: (jsonData: string) => boolean
  clearAllData: () => boolean
  storageUsage: { used: number; total: number; percentage: number }
  
  // Loading states
  loading: boolean
  error: string | null
}

export function useTrailData(): UseTrailDataReturn {
  const { address } = useWallet()
  
  const [recordings, setRecordings] = useState<TrailRecording[]>([])
  const [completedTrails, setCompletedTrails] = useState<CompletedTrail[]>([])
  const [userStats, setUserStats] = useState<UserTrailStats>({
    totalTrails: 0,
    totalDistance: 0,
    totalDuration: 0,
    totalElevationGain: 0,
    trekTokensEarned: 0,
    nftsMinted: 0,
    achievements: [],
  })
  const [storageUsage, setStorageUsage] = useState({ used: 0, total: 0, percentage: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load data from storage
  const loadData = useCallback(() => {
    try {
      setLoading(true)
      setError(null)
      
      // Load recordings
      const loadedRecordings = TrailStorage.getTrailRecordings()
      setRecordings(loadedRecordings)
      
      // Load completed trails for current user
      if (address) {
        const loadedTrails = TrailStorage.getCompletedTrails(address)
        setCompletedTrails(loadedTrails)
        
        const loadedStats = TrailStorage.getUserStats(address)
        setUserStats(loadedStats)
      } else {
        setCompletedTrails([])
        setUserStats({
          totalTrails: 0,
          totalDistance: 0,
          totalDuration: 0,
          totalElevationGain: 0,
          trekTokensEarned: 0,
          nftsMinted: 0,
          achievements: [],
        })
      }
      
      // Load storage usage
      const usage = TrailStorage.getStorageUsage()
      setStorageUsage(usage)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trail data')
    } finally {
      setLoading(false)
    }
  }, [address])

  // Save recording
  const saveRecording = useCallback((recording: TrailRecording): boolean => {
    try {
      const success = TrailStorage.saveTrailRecording(recording)
      if (success) {
        setRecordings(prev => {
          const existing = prev.findIndex(r => r.id === recording.id)
          if (existing >= 0) {
            const updated = [...prev]
            updated[existing] = recording
            return updated
          } else {
            return [...prev, recording]
          }
        })
        
        // Update storage usage
        setStorageUsage(TrailStorage.getStorageUsage())
      }
      return success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save recording')
      return false
    }
  }, [])

  // Delete recording
  const deleteRecording = useCallback((id: string): boolean => {
    try {
      const success = TrailStorage.deleteTrailRecording(id)
      if (success) {
        setRecordings(prev => prev.filter(r => r.id !== id))
        setStorageUsage(TrailStorage.getStorageUsage())
      }
      return success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete recording')
      return false
    }
  }, [])

  // Get recording by ID
  const getRecording = useCallback((id: string): TrailRecording | null => {
    return recordings.find(r => r.id === id) || null
  }, [recordings])

  // Save completed trail
  const saveCompletedTrail = useCallback((trail: CompletedTrail): boolean => {
    if (!address) {
      setError('Wallet not connected')
      return false
    }

    try {
      const trailWithAddress = { ...trail, walletAddress: address }
      const success = TrailStorage.saveCompletedTrail(trailWithAddress)
      
      if (success) {
        setCompletedTrails(prev => {
          const existing = prev.findIndex(t => t.id === trail.id)
          if (existing >= 0) {
            const updated = [...prev]
            updated[existing] = trailWithAddress
            return updated
          } else {
            return [...prev, trailWithAddress]
          }
        })
        
        // Refresh stats
        const updatedStats = TrailStorage.getUserStats(address)
        setUserStats(updatedStats)
        
        // Update storage usage
        setStorageUsage(TrailStorage.getStorageUsage())
      }
      
      return success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save completed trail')
      return false
    }
  }, [address])

  // Get completed trail by ID
  const getCompletedTrail = useCallback((id: string): CompletedTrail | null => {
    return completedTrails.find(t => t.id === id) || null
  }, [completedTrails])

  // Refresh stats
  const refreshStats = useCallback(() => {
    if (address) {
      const stats = TrailStorage.getUserStats(address)
      setUserStats(stats)
    }
  }, [address])

  // Export data
  const exportData = useCallback((): string => {
    if (!address) {
      throw new Error('Wallet not connected')
    }
    return TrailStorage.exportTrailData(address)
  }, [address])

  // Import data
  const importData = useCallback((jsonData: string): boolean => {
    try {
      const success = TrailStorage.importTrailData(jsonData)
      if (success) {
        loadData() // Reload all data
      }
      return success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import data')
      return false
    }
  }, [loadData])

  // Clear all data
  const clearAllData = useCallback((): boolean => {
    try {
      const success = TrailStorage.clearAllData()
      if (success) {
        setRecordings([])
        setCompletedTrails([])
        setUserStats({
          totalTrails: 0,
          totalDistance: 0,
          totalDuration: 0,
          totalElevationGain: 0,
          trekTokensEarned: 0,
          nftsMinted: 0,
          achievements: [],
        })
        setStorageUsage({ used: 0, total: 0, percentage: 0 })
      }
      return success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear data')
      return false
    }
  }, [])

  // Load data when component mounts or address changes
  useEffect(() => {
    loadData()
  }, [loadData])

  return {
    recordings,
    saveRecording,
    deleteRecording,
    getRecording,
    completedTrails,
    saveCompletedTrail,
    getCompletedTrail,
    userStats,
    refreshStats,
    exportData,
    importData,
    clearAllData,
    storageUsage,
    loading,
    error,
  }
}
