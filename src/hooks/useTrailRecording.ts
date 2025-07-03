'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { TrailRecording, GPSCoordinate } from '@/types/trail'
import { useGPSTracking } from './useGPSTracking'
import {
  calculateTotalDistance,
  calculateAverageSpeed,
  calculateMaxSpeed,
  calculateElevationGain,
  calculateElevationLoss,
  generateTrailId,
  smoothCoordinates,
} from '@/lib/trailUtils'

interface UseTrailRecordingOptions {
  autoSave?: boolean
  smoothingEnabled?: boolean
  minDistanceThreshold?: number // minimum distance in meters to record a point
}

interface UseTrailRecordingReturn {
  recording: TrailRecording | null
  isRecording: boolean
  isPaused: boolean
  startRecording: (name: string, description?: string) => Promise<boolean>
  stopRecording: () => TrailRecording | null
  pauseRecording: () => void
  resumeRecording: () => void
  addManualPoint: (coordinate: GPSCoordinate) => void
  getCurrentStats: () => {
    distance: number
    duration: number
    averageSpeed: number
    currentSpeed: number
  }
}

export function useTrailRecording(options: UseTrailRecordingOptions = {}): UseTrailRecordingReturn {
  const {
    autoSave = true,
    smoothingEnabled = true,
    minDistanceThreshold = 5, // 5 meters
  } = options

  const [recording, setRecording] = useState<TrailRecording | null>(null)
  const lastCoordinateRef = useRef<GPSCoordinate | null>(null)
  const startTimeRef = useRef<Date | null>(null)
  const pausedTimeRef = useRef<number>(0) // total paused time in ms

  const {
    trackingState,
    currentPosition,
    startTracking,
    stopTracking,
    pauseTracking,
    resumeTracking,
  } = useGPSTracking({
    enableHighAccuracy: true,
    trackingInterval: 3000, // 3 seconds for trail recording
  })

  const isRecording = recording?.isActive || false
  const isPaused = recording?.isPaused || false

  // Add coordinate to recording
  const addCoordinate = useCallback((coordinate: GPSCoordinate) => {
    if (!recording || !recording.isActive || recording.isPaused) return

    setRecording(prev => {
      if (!prev) return null

      // Check minimum distance threshold
      if (lastCoordinateRef.current && minDistanceThreshold > 0) {
        const distance = calculateTotalDistance([lastCoordinateRef.current, coordinate])
        if (distance < minDistanceThreshold) {
          return prev // Don't add point if too close to last point
        }
      }

      const newCoordinates = [...prev.coordinates, coordinate]
      lastCoordinateRef.current = coordinate

      // Calculate updated statistics
      const totalDistance = calculateTotalDistance(newCoordinates)
      const currentTime = new Date()
      const totalDuration = startTimeRef.current 
        ? (currentTime.getTime() - startTimeRef.current.getTime() - pausedTimeRef.current) / 1000
        : 0

      const averageSpeed = calculateAverageSpeed(totalDistance, totalDuration)
      const maxSpeed = calculateMaxSpeed(newCoordinates)
      const elevationGain = calculateElevationGain(newCoordinates)
      const elevationLoss = calculateElevationLoss(newCoordinates)

      return {
        ...prev,
        coordinates: newCoordinates,
        totalDistance,
        totalDuration,
        averageSpeed,
        maxSpeed,
        elevationGain,
        elevationLoss,
      }
    })
  }, [recording, minDistanceThreshold])

  // Start recording
  const startRecording = useCallback(async (name: string, description?: string): Promise<boolean> => {
    const trackingStarted = await startTracking()
    if (!trackingStarted) return false

    const now = new Date()
    startTimeRef.current = now
    pausedTimeRef.current = 0

    const newRecording: TrailRecording = {
      id: generateTrailId(),
      name,
      description,
      startTime: now.toISOString(),
      coordinates: [],
      isActive: true,
      isPaused: false,
      totalDistance: 0,
      totalDuration: 0,
      averageSpeed: 0,
      maxSpeed: 0,
      elevationGain: 0,
      elevationLoss: 0,
    }

    setRecording(newRecording)
    lastCoordinateRef.current = null

    return true
  }, [startTracking])

  // Stop recording
  const stopRecording = useCallback((): TrailRecording | null => {
    if (!recording) return null

    stopTracking()

    const finalRecording: TrailRecording = {
      ...recording,
      endTime: new Date().toISOString(),
      isActive: false,
      isPaused: false,
      coordinates: smoothingEnabled ? smoothCoordinates(recording.coordinates) : recording.coordinates,
    }

    setRecording(null)
    startTimeRef.current = null
    pausedTimeRef.current = 0
    lastCoordinateRef.current = null

    // Auto-save if enabled (async operation without blocking)
    if (autoSave) {
      import('@/lib/trailStorage')
        .then(({ TrailStorage }) => {
          TrailStorage.saveTrailRecording(finalRecording)
        })
        .catch((error) => {
          console.error('Failed to save trail recording:', error)
        })
    }

    return finalRecording
  }, [recording, stopTracking, smoothingEnabled, autoSave])

  // Pause recording
  const pauseRecording = useCallback(() => {
    if (!recording || !recording.isActive) return

    pauseTracking()
    setRecording(prev => prev ? { ...prev, isPaused: true } : null)
  }, [recording, pauseTracking])

  // Resume recording
  const resumeRecording = useCallback(() => {
    if (!recording || !recording.isActive) return

    resumeTracking()
    setRecording(prev => prev ? { ...prev, isPaused: false } : null)
  }, [recording, resumeTracking])

  // Add manual point
  const addManualPoint = useCallback((coordinate: GPSCoordinate) => {
    addCoordinate(coordinate)
  }, [addCoordinate])

  // Get current statistics
  const getCurrentStats = useCallback(() => {
    if (!recording) {
      return { distance: 0, duration: 0, averageSpeed: 0, currentSpeed: 0 }
    }

    const currentTime = new Date()
    const duration = startTimeRef.current 
      ? (currentTime.getTime() - startTimeRef.current.getTime() - pausedTimeRef.current) / 1000
      : 0

    let currentSpeed = 0
    if (recording.coordinates.length >= 2) {
      const lastTwo = recording.coordinates.slice(-2)
      const distance = calculateTotalDistance(lastTwo)
      const timeDiff = (new Date(lastTwo[1].timestamp).getTime() - new Date(lastTwo[0].timestamp).getTime()) / 1000
      currentSpeed = timeDiff > 0 ? distance / timeDiff : 0
    }

    return {
      distance: recording.totalDistance,
      duration,
      averageSpeed: recording.averageSpeed,
      currentSpeed,
    }
  }, [recording])

  // Add current position to recording when GPS updates
  useEffect(() => {
    if (currentPosition && recording?.isActive && !recording.isPaused) {
      addCoordinate(currentPosition)
    }
  }, [currentPosition, recording, addCoordinate])

  return {
    recording,
    isRecording,
    isPaused,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    addManualPoint,
    getCurrentStats,
  }
}
