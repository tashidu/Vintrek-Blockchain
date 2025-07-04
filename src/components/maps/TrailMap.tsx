'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, Navigation, Download, Lock, Map, User } from 'lucide-react'
import { usePremiumStatus } from '@/components/premium/PremiumStatus'
import styles from './TrailMap.module.css'
import { getTileLayerConfig, getSriLankaBounds, preloadSriLankaTiles } from './OptimizedTileLayer'
import { useMapPerformance } from '@/hooks/useMapPerformance'
import { TrailRoute } from '@/types'

// Optimized: Single dynamic import for all React Leaflet components
const ReactLeafletComponents = dynamic(
  () => import('react-leaflet').then((mod) => ({
    MapContainer: mod.MapContainer,
    TileLayer: mod.TileLayer,
    Marker: mod.Marker,
    Popup: mod.Popup,
    Polyline: mod.Polyline,
  })),
  {
    ssr: false,
    loading: () => (
      <div className="bg-gray-100 rounded-lg flex items-center justify-center h-96 animate-pulse">
        <div className="text-center">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2 animate-bounce" />
          <p className="text-gray-600">Loading map...</p>
          <div className="w-32 h-2 bg-gray-300 rounded-full mt-2 mx-auto overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }
)

interface TrailCoordinate {
  lat: number
  lng: number
  elevation?: number
  timestamp?: string
}

interface TrailMapProps {
  trailName: string
  coordinates: TrailCoordinate[]
  startPoint?: TrailCoordinate
  endPoint?: TrailCoordinate
  difficulty: 'Easy' | 'Moderate' | 'Hard'
  distance: string
  liveTracking?: boolean
  className?: string
  // Multi-route support
  routes?: TrailRoute[]
  selectedRouteId?: string
  onRouteChange?: (routeId: string) => void
}

export function TrailMap({
  trailName,
  coordinates,
  startPoint,
  endPoint,
  difficulty,
  distance,
  liveTracking = false,
  className = '',
  routes = [],
  selectedRouteId,
  onRouteChange
}: TrailMapProps) {
  const [isClient, setIsClient] = useState(false)
  const [L, setL] = useState<any>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const { isPremium, checkFeatureAccess } = usePremiumStatus()
  const { metrics, markLoadComplete, markTileLoadComplete } = useMapPerformance()

  // Optimized: Memoize coordinate calculations with bounds checking
  const { center, allCoords, mapBounds, selectedRoute, routeCoords, routeStartPoint, routeEndPoint } = useMemo(() => {
    // Use selected route if available, otherwise fall back to legacy coordinates
    let selectedRouteData = null
    let routeCoordinates = [...coordinates]
    let routeStart = startPoint
    let routeEnd = endPoint

    if (routes.length > 0) {
      selectedRouteData = routes.find(route => route.id === selectedRouteId) || routes[0]
      if (selectedRouteData) {
        routeCoordinates = [...selectedRouteData.gpsRoute]
        routeStart = selectedRouteData.startPoint
        routeEnd = selectedRouteData.endPoint
      }
    }

    const coords = [...routeCoordinates]
    if (routeStart) coords.unshift(routeStart)
    if (routeEnd) coords.push(routeEnd)

    const sriLankaBounds = getSriLankaBounds()
    const mapCenter: [number, number] = coords.length > 0
      ? [
          coords.reduce((sum, coord) => sum + coord.lat, 0) / coords.length,
          coords.reduce((sum, coord) => sum + coord.lng, 0) / coords.length
        ]
      : sriLankaBounds.center

    return {
      center: mapCenter,
      allCoords: coords,
      mapBounds: sriLankaBounds,
      selectedRoute: selectedRouteData,
      routeCoords: routeCoordinates,
      routeStartPoint: routeStart,
      routeEndPoint: routeEnd
    }
  }, [coordinates, startPoint, endPoint, routes, selectedRouteId])

  // Optimized: Preload Leaflet with better error handling and tile preloading
  useEffect(() => {
    let mounted = true

    const loadLeaflet = async () => {
      try {
        setIsClient(true)

        // Preload tiles for better performance
        preloadSriLankaTiles()

        const leaflet = await import('leaflet')

        if (!mounted) return

        setL(leaflet.default)

        // Fix for default markers
        delete (leaflet.default.Icon.Default.prototype as any)._getIconUrl
        leaflet.default.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        })

        setMapLoaded(true)
        markLoadComplete()
      } catch (error) {
        console.error('Failed to load Leaflet:', error)
      }
    }

    loadLeaflet()

    return () => {
      mounted = false
    }
  }, [markLoadComplete])

  if (!isClient || !L || !mapLoaded) {
    return (
      <div className={`${styles.mapLoadingContainer} rounded-lg flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <div className="relative">
            <MapPin className={`h-12 w-12 text-blue-500 mx-auto mb-2 ${styles.loadingBounce}`} />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-ping"></div>
          </div>
          <p className="text-gray-700 font-medium">Loading interactive map...</p>
          <div className="w-48 h-2 bg-gray-200 rounded-full mt-3 mx-auto overflow-hidden">
            <div className={`h-full rounded-full ${styles.progressBar}`}></div>
          </div>
        </div>
      </div>
    )
  }

  // Optimized: Memoize custom icons creation
  const { startIcon, endIcon, getDifficultyColor } = useMemo(() => {
    const createCustomIcon = (color: string, icon: string) => {
      return L.divIcon({
        html: `
          <div class="${styles.customTrailMarker}" style="background-color: ${color};">
            ${icon}
          </div>
        `,
        className: 'custom-marker',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      })
    }

    const difficultyColorMap = {
      'Easy': '#10B981',
      'Moderate': '#F59E0B',
      'Hard': '#EF4444'
    } as const

    const getDiffColor = (diff: string) => {
      return difficultyColorMap[diff as keyof typeof difficultyColorMap] || '#6B7280'
    }

    return {
      startIcon: createCustomIcon('#10B981', 'S'),
      endIcon: createCustomIcon('#EF4444', 'E'),
      getDifficultyColor: getDiffColor
    }
  }, [L])

  // Optimized: Memoize polyline positions
  const polylinePositions = useMemo(() => {
    return routeCoords.length > 1 ? routeCoords.map(coord => [coord.lat, coord.lng] as [number, number]) : []
  }, [routeCoords])

  const canUseLiveTracking = checkFeatureAccess('gps_navigation')
  const canDownloadMap = checkFeatureAccess('offline_maps')

  return (
    <div className={`relative ${className}`}>
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-[1000] space-y-2">
        {liveTracking && (
          <button
            type="button"
            disabled={!canUseLiveTracking}
            className={`p-2 rounded-lg shadow-md transition-colors ${
              canUseLiveTracking
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            title={canUseLiveTracking ? 'GPS Navigation' : 'Premium feature - GPS Navigation'}
          >
            {canUseLiveTracking ? <Navigation className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
          </button>
        )}

        <button
          type="button"
          disabled={!canDownloadMap}
          className={`p-2 rounded-lg shadow-md transition-colors ${
            canDownloadMap
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          title={canDownloadMap ? 'Download for offline use' : 'Premium feature - Offline maps'}
        >
          {canDownloadMap ? <Download className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
        </button>
      </div>

      {/* Trail Info Overlay */}
      <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-md p-3 max-w-xs">
        <h3 className="font-semibold text-gray-900 mb-1">{trailName}</h3>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span className={`px-2 py-1 rounded-full text-xs font-medium`}
                style={{ backgroundColor: getDifficultyColor(difficulty) + '20', color: getDifficultyColor(difficulty) }}>
            {difficulty}
          </span>
          <span>{distance}</span>
        </div>
      </div>

      {/* Route Selection Overlay */}
      {routes.length > 1 && (
        <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-md p-3 max-w-sm">
          <div className="flex items-center mb-2">
            <Map className="h-4 w-4 mr-2 text-purple-600" />
            <h4 className="font-medium text-gray-900">Choose Route</h4>
          </div>
          <div className="space-y-2">
            {routes.map((route) => (
              <button
                key={route.id}
                onClick={() => onRouteChange?.(route.id)}
                className={`w-full text-left p-2 rounded-md border transition-colors ${
                  selectedRouteId === route.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{route.name}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium`}
                        style={{ backgroundColor: getDifficultyColor(route.difficulty) + '20', color: getDifficultyColor(route.difficulty) }}>
                    {route.difficulty}
                  </span>
                </div>
                <div className="text-xs text-gray-600 mb-1">
                  {route.distance} • {route.duration}
                </div>
                {route.isUserContributed && route.contributedByName && (
                  <div className="flex items-center text-xs text-blue-600">
                    <User className="h-3 w-3 mr-1" />
                    <span>Added by {route.contributedByName}</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Premium Feature Overlay */}
      {!isPremium && (liveTracking || !checkFeatureAccess('view_maps')) && (
        <div className="absolute inset-0 z-[1001] bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
          <div className="bg-white rounded-lg p-6 text-center max-w-sm mx-4">
            <Lock className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Premium Feature</h3>
            <p className="text-gray-600 mb-4">
              {liveTracking 
                ? 'GPS navigation requires a premium account. Earn 300 TREK tokens to unlock.'
                : 'This trail requires premium access. Earn 300 TREK tokens to unlock.'}
            </p>
            <button type="button" className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className={`h-96 rounded-lg overflow-hidden ${styles.mapContainer}`}>
        <ReactLeafletComponents.MapContainer
          center={center}
          zoom={mapBounds.defaultZoom}
          maxZoom={mapBounds.maxZoom}
          minZoom={mapBounds.minZoom}
          style={{ height: '100%', width: '100%' }}
          className="rounded-lg"
          preferCanvas={true}
          zoomControl={false}
          attributionControl={false}
        >
          <ReactLeafletComponents.TileLayer
            {...getTileLayerConfig('default')}
            eventHandlers={{
              load: markTileLoadComplete,
              loading: () => {
                // Tiles are loading
              }
            }}
          />

          {/* Trail Route - Optimized rendering */}
          {polylinePositions.length > 1 && (
            <ReactLeafletComponents.Polyline
              positions={polylinePositions}
              color={getDifficultyColor(difficulty)}
              weight={4}
              opacity={0.8}
              smoothFactor={1}
            />
          )}

          {/* Start Point */}
          {routeStartPoint && (
            <ReactLeafletComponents.Marker position={[routeStartPoint.lat, routeStartPoint.lng]} icon={startIcon}>
              <ReactLeafletComponents.Popup>
                <div className="text-center">
                  <h4 className="font-semibold text-green-700">Trail Start</h4>
                  {selectedRoute && (
                    <p className="text-sm font-medium text-gray-800 mb-1">{selectedRoute.name}</p>
                  )}
                  <p className="text-sm text-gray-600">
                    {routeStartPoint.lat.toFixed(6)}, {routeStartPoint.lng.toFixed(6)}
                  </p>
                  {selectedRoute?.isUserContributed && selectedRoute.contributedByName && (
                    <p className="text-xs text-blue-600 mt-1">Added by {selectedRoute.contributedByName}</p>
                  )}
                </div>
              </ReactLeafletComponents.Popup>
            </ReactLeafletComponents.Marker>
          )}

          {/* End Point */}
          {routeEndPoint && (
            <ReactLeafletComponents.Marker position={[routeEndPoint.lat, routeEndPoint.lng]} icon={endIcon}>
              <ReactLeafletComponents.Popup>
                <div className="text-center">
                  <h4 className="font-semibold text-red-700">Trail End</h4>
                  {selectedRoute && (
                    <p className="text-sm font-medium text-gray-800 mb-1">{selectedRoute.name}</p>
                  )}
                  <p className="text-sm text-gray-600">
                    {routeEndPoint.lat.toFixed(6)}, {routeEndPoint.lng.toFixed(6)}
                  </p>
                  {selectedRoute?.isUserContributed && selectedRoute.contributedByName && (
                    <p className="text-xs text-blue-600 mt-1">Added by {selectedRoute.contributedByName}</p>
                  )}
                </div>
              </ReactLeafletComponents.Popup>
            </ReactLeafletComponents.Marker>
          )}
        </ReactLeafletComponents.MapContainer>
      </div>


    </div>
  )
}
