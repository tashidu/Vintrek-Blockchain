'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { GPSCoordinate, GPSTrackingState } from '@/types/trail'

interface UseGPSTrackingOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
  trackingInterval?: number // in milliseconds
}

interface UseGPSTrackingReturn {
  trackingState: GPSTrackingState
  currentPosition: GPSCoordinate | null
  startTracking: () => Promise<boolean>
  stopTracking: () => void
  pauseTracking: () => void
  resumeTracking: () => void
  requestPermission: () => Promise<boolean>
  isSupported: boolean
}

export function useGPSTracking(options: UseGPSTrackingOptions = {}): UseGPSTrackingReturn {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 1000,
    trackingInterval = 5000, // 5 seconds
  } = options

  const [trackingState, setTrackingState] = useState<GPSTrackingState>({
    isTracking: false,
    isPaused: false,
    hasPermission: false,
    accuracy: 0,
  })

  const [currentPosition, setCurrentPosition] = useState<GPSCoordinate | null>(null)
  const watchIdRef = useRef<number | null>(null)
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null)

  // Check if geolocation is supported
  const isSupported = typeof navigator !== 'undefined' && 'geolocation' in navigator

  // Request location permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setTrackingState(prev => ({ ...prev, error: 'Geolocation not supported' }))
      return false
    }

    try {
      // Try to get current position to check permission
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy,
          timeout,
          maximumAge,
        })
      })

      const coordinate: GPSCoordinate = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        altitude: position.coords.altitude || undefined,
        accuracy: position.coords.accuracy,
        timestamp: new Date().toISOString(),
      }

      setCurrentPosition(coordinate)
      setTrackingState(prev => ({
        ...prev,
        hasPermission: true,
        accuracy: position.coords.accuracy,
        error: undefined,
      }))

      return true
    } catch (error) {
      const geoError = error as GeolocationPositionError
      let errorMessage = 'Permission denied'

      switch (geoError.code) {
        case geoError.PERMISSION_DENIED:
          errorMessage = 'Location permission denied'
          break
        case geoError.POSITION_UNAVAILABLE:
          errorMessage = 'Location unavailable'
          break
        case geoError.TIMEOUT:
          errorMessage = 'Location request timeout'
          break
        default:
          errorMessage = 'Unknown location error'
      }

      setTrackingState(prev => ({
        ...prev,
        hasPermission: false,
        error: errorMessage,
      }))

      return false
    }
  }, [isSupported, enableHighAccuracy, timeout, maximumAge])

  // Start GPS tracking
  const startTracking = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false

    // Request permission first
    const hasPermission = await requestPermission()
    if (!hasPermission) return false

    setTrackingState(prev => ({
      ...prev,
      isTracking: true,
      isPaused: false,
      error: undefined,
    }))

    // Start watching position
    if (navigator.geolocation.watchPosition) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const coordinate: GPSCoordinate = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            altitude: position.coords.altitude || undefined,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString(),
          }

          setCurrentPosition(coordinate)
          setTrackingState(prev => ({
            ...prev,
            accuracy: position.coords.accuracy,
            error: undefined,
          }))
        },
        (error) => {
          const geoError = error as GeolocationPositionError
          let errorMessage = 'Tracking error'

          switch (geoError.code) {
            case geoError.PERMISSION_DENIED:
              errorMessage = 'Location permission denied'
              break
            case geoError.POSITION_UNAVAILABLE:
              errorMessage = 'Location unavailable'
              break
            case geoError.TIMEOUT:
              errorMessage = 'Location request timeout'
              break
          }

          setTrackingState(prev => ({
            ...prev,
            error: errorMessage,
          }))
        },
        {
          enableHighAccuracy,
          timeout,
          maximumAge,
        }
      )

      watchIdRef.current = watchId
      setTrackingState(prev => ({ ...prev, watchId }))
    } else {
      // Fallback to interval-based tracking
      const intervalId = setInterval(async () => {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy,
              timeout,
              maximumAge,
            })
          })

          const coordinate: GPSCoordinate = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            altitude: position.coords.altitude || undefined,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString(),
          }

          setCurrentPosition(coordinate)
          setTrackingState(prev => ({
            ...prev,
            accuracy: position.coords.accuracy,
            error: undefined,
          }))
        } catch (error) {
          console.error('GPS tracking error:', error)
        }
      }, trackingInterval)

      intervalIdRef.current = intervalId
    }

    return true
  }, [isSupported, requestPermission, enableHighAccuracy, timeout, maximumAge, trackingInterval])

  // Stop GPS tracking
  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }

    if (intervalIdRef.current !== null) {
      clearInterval(intervalIdRef.current)
      intervalIdRef.current = null
    }

    setTrackingState(prev => ({
      ...prev,
      isTracking: false,
      isPaused: false,
      watchId: undefined,
    }))
  }, [])

  // Pause tracking
  const pauseTracking = useCallback(() => {
    setTrackingState(prev => ({
      ...prev,
      isPaused: true,
    }))
  }, [])

  // Resume tracking
  const resumeTracking = useCallback(() => {
    setTrackingState(prev => ({
      ...prev,
      isPaused: false,
    }))
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracking()
    }
  }, [stopTracking])

  return {
    trackingState,
    currentPosition,
    startTracking,
    stopTracking,
    pauseTracking,
    resumeTracking,
    requestPermission,
    isSupported,
  }
}
