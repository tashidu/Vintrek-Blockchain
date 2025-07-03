'use client'

import { useEffect, useState } from 'react'
import { MapPin, Satellite, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { useGPSTracking } from '@/hooks/useGPSTracking'

interface LocationStatusProps {
  className?: string
  showDetails?: boolean
}

export function LocationStatus({ className = '', showDetails = true }: LocationStatusProps) {
  const { trackingState, currentPosition, requestPermission, isSupported } = useGPSTracking()
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  useEffect(() => {
    if (currentPosition) {
      setLastUpdate(new Date())
    }
  }, [currentPosition])

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy <= 5) return 'text-green-600'
    if (accuracy <= 15) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getAccuracyText = (accuracy: number) => {
    if (accuracy <= 5) return 'Excellent'
    if (accuracy <= 15) return 'Good'
    if (accuracy <= 50) return 'Fair'
    return 'Poor'
  }

  const formatCoordinate = (coord: number, isLongitude = false) => {
    const direction = isLongitude ? (coord >= 0 ? 'E' : 'W') : (coord >= 0 ? 'N' : 'S')
    return `${Math.abs(coord).toFixed(6)}° ${direction}`
  }

  if (!isSupported) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <span className="text-red-800 font-medium">GPS Not Supported</span>
        </div>
        <p className="text-red-700 text-sm mt-1">
          Your device or browser doesn't support GPS tracking.
        </p>
      </div>
    )
  }

  if (!trackingState.hasPermission) {
    return (
      <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <span className="text-yellow-800 font-medium">Location Permission Required</span>
          </div>
          <button
            onClick={requestPermission}
            className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 transition-colors"
          >
            Enable
          </button>
        </div>
        <p className="text-yellow-700 text-sm mt-1">
          Allow location access to start tracking your trail.
        </p>
      </div>
    )
  }

  if (trackingState.error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <span className="text-red-800 font-medium">GPS Error</span>
        </div>
        <p className="text-red-700 text-sm mt-1">{trackingState.error}</p>
        <button
          onClick={requestPermission}
          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors mt-2"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!currentPosition) {
    return (
      <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-2">
          <Satellite className="h-5 w-5 text-blue-600 animate-pulse" />
          <span className="text-blue-800 font-medium">Acquiring GPS Signal...</span>
        </div>
        <p className="text-blue-700 text-sm mt-1">
          Searching for satellites. This may take a few moments.
        </p>
      </div>
    )
  }

  return (
    <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
      {/* Status Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-green-800 font-medium">GPS Active</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-green-700">
          <Satellite className="h-4 w-4" />
          <span className={getAccuracyColor(trackingState.accuracy)}>
            {getAccuracyText(trackingState.accuracy)}
          </span>
        </div>
      </div>

      {showDetails && (
        <>
          {/* Coordinates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div className="bg-white rounded p-3">
              <div className="flex items-center space-x-2 mb-1">
                <MapPin className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Latitude</span>
              </div>
              <div className="font-mono text-sm text-gray-900">
                {formatCoordinate(currentPosition.latitude)}
              </div>
            </div>
            
            <div className="bg-white rounded p-3">
              <div className="flex items-center space-x-2 mb-1">
                <MapPin className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Longitude</span>
              </div>
              <div className="font-mono text-sm text-gray-900">
                {formatCoordinate(currentPosition.longitude, true)}
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="bg-white rounded p-2">
              <div className="text-gray-600 mb-1">Accuracy</div>
              <div className="font-semibold text-gray-900">
                ±{Math.round(trackingState.accuracy)}m
              </div>
            </div>

            {currentPosition.altitude && (
              <div className="bg-white rounded p-2">
                <div className="text-gray-600 mb-1">Altitude</div>
                <div className="font-semibold text-gray-900">
                  {Math.round(currentPosition.altitude)}m
                </div>
              </div>
            )}

            <div className="bg-white rounded p-2">
              <div className="text-gray-600 mb-1">Status</div>
              <div className="font-semibold text-gray-900">
                {trackingState.isTracking ? (
                  trackingState.isPaused ? 'Paused' : 'Tracking'
                ) : 'Ready'}
              </div>
            </div>

            {lastUpdate && (
              <div className="bg-white rounded p-2">
                <div className="flex items-center space-x-1 text-gray-600 mb-1">
                  <Clock className="h-3 w-3" />
                  <span>Updated</span>
                </div>
                <div className="font-semibold text-gray-900 text-xs">
                  {lastUpdate.toLocaleTimeString()}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
