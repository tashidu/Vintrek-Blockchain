'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, Navigation, Download, Lock } from 'lucide-react'
import { usePremiumStatus } from '@/components/premium/PremiumStatus'

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)
const Polyline = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
  { ssr: false }
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
}

export function TrailMap({
  trailName,
  coordinates,
  startPoint,
  endPoint,
  difficulty,
  distance,
  liveTracking = false,
  className = ''
}: TrailMapProps) {
  const [isClient, setIsClient] = useState(false)
  const [L, setL] = useState<any>(null)
  const { isPremium, checkFeatureAccess } = usePremiumStatus()

  useEffect(() => {
    setIsClient(true)
    // Dynamically import Leaflet
    import('leaflet').then((leaflet) => {
      setL(leaflet.default)
      
      // Fix for default markers
      delete (leaflet.default.Icon.Default.prototype as any)._getIconUrl
      leaflet.default.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      })
    })
  }, [])

  if (!isClient || !L) {
    return (
      <div className={`bg-gray-200 rounded-lg flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    )
  }

  // Calculate map center and bounds
  const allCoords = [...coordinates]
  if (startPoint) allCoords.unshift(startPoint)
  if (endPoint) allCoords.push(endPoint)

  const center: [number, number] = allCoords.length > 0 
    ? [
        allCoords.reduce((sum, coord) => sum + coord.lat, 0) / allCoords.length,
        allCoords.reduce((sum, coord) => sum + coord.lng, 0) / allCoords.length
      ]
    : [7.8731, 80.7718] // Default to Sri Lanka center

  // Create custom icons
  const createCustomIcon = (color: string, icon: string) => {
    return L.divIcon({
      html: `
        <div style="
          background-color: ${color};
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 12px;
        ">${icon}</div>
      `,
      className: 'custom-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    })
  }

  const startIcon = createCustomIcon('#10B981', 'S')
  const endIcon = createCustomIcon('#EF4444', 'E')

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Easy': return '#10B981'
      case 'Moderate': return '#F59E0B'
      case 'Hard': return '#EF4444'
      default: return '#6B7280'
    }
  }

  const canUseLiveTracking = checkFeatureAccess('gps_navigation')
  const canDownloadMap = checkFeatureAccess('offline_maps')

  return (
    <div className={`relative ${className}`}>
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-[1000] space-y-2">
        {liveTracking && (
          <button
            disabled={!canUseLiveTracking}
            className={`p-2 rounded-lg shadow-md ${
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
          disabled={!canDownloadMap}
          className={`p-2 rounded-lg shadow-md ${
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
            <button className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="h-96 rounded-lg overflow-hidden">
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          className="rounded-lg"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Trail Route */}
          {coordinates.length > 1 && (
            <Polyline
              positions={coordinates.map(coord => [coord.lat, coord.lng])}
              color={getDifficultyColor(difficulty)}
              weight={4}
              opacity={0.8}
            />
          )}

          {/* Start Point */}
          {startPoint && (
            <Marker position={[startPoint.lat, startPoint.lng]} icon={startIcon}>
              <Popup>
                <div className="text-center">
                  <h4 className="font-semibold text-green-700">Trail Start</h4>
                  <p className="text-sm text-gray-600">
                    {startPoint.lat.toFixed(6)}, {startPoint.lng.toFixed(6)}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* End Point */}
          {endPoint && (
            <Marker position={[endPoint.lat, endPoint.lng]} icon={endIcon}>
              <Popup>
                <div className="text-center">
                  <h4 className="font-semibold text-red-700">Trail End</h4>
                  <p className="text-sm text-gray-600">
                    {endPoint.lat.toFixed(6)}, {endPoint.lng.toFixed(6)}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  )
}
