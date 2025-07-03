import { GPSCoordinate, DistanceUnit, SpeedUnit } from '@/types/trail'

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * @param coord1 First coordinate
 * @param coord2 Second coordinate
 * @returns Distance in meters
 */
export function calculateDistance(coord1: GPSCoordinate, coord2: GPSCoordinate): number {
  const R = 6371000 // Earth's radius in meters
  const φ1 = (coord1.latitude * Math.PI) / 180
  const φ2 = (coord2.latitude * Math.PI) / 180
  const Δφ = ((coord2.latitude - coord1.latitude) * Math.PI) / 180
  const Δλ = ((coord2.longitude - coord1.longitude) * Math.PI) / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

/**
 * Calculate total distance for an array of coordinates
 * @param coordinates Array of GPS coordinates
 * @returns Total distance in meters
 */
export function calculateTotalDistance(coordinates: GPSCoordinate[]): number {
  if (coordinates.length < 2) return 0

  let totalDistance = 0
  for (let i = 1; i < coordinates.length; i++) {
    totalDistance += calculateDistance(coordinates[i - 1], coordinates[i])
  }
  return totalDistance
}

/**
 * Calculate elevation gain from coordinates
 * @param coordinates Array of GPS coordinates with altitude
 * @returns Elevation gain in meters
 */
export function calculateElevationGain(coordinates: GPSCoordinate[]): number {
  if (coordinates.length < 2) return 0

  let elevationGain = 0
  for (let i = 1; i < coordinates.length; i++) {
    const prev = coordinates[i - 1]
    const curr = coordinates[i]
    
    if (prev.altitude !== undefined && curr.altitude !== undefined) {
      const diff = curr.altitude - prev.altitude
      if (diff > 0) {
        elevationGain += diff
      }
    }
  }
  return elevationGain
}

/**
 * Calculate elevation loss from coordinates
 * @param coordinates Array of GPS coordinates with altitude
 * @returns Elevation loss in meters
 */
export function calculateElevationLoss(coordinates: GPSCoordinate[]): number {
  if (coordinates.length < 2) return 0

  let elevationLoss = 0
  for (let i = 1; i < coordinates.length; i++) {
    const prev = coordinates[i - 1]
    const curr = coordinates[i]
    
    if (prev.altitude !== undefined && curr.altitude !== undefined) {
      const diff = prev.altitude - curr.altitude
      if (diff > 0) {
        elevationLoss += diff
      }
    }
  }
  return elevationLoss
}

/**
 * Calculate average speed
 * @param distance Distance in meters
 * @param duration Duration in seconds
 * @returns Average speed in m/s
 */
export function calculateAverageSpeed(distance: number, duration: number): number {
  if (duration === 0) return 0
  return distance / duration
}

/**
 * Calculate maximum speed from coordinates
 * @param coordinates Array of GPS coordinates with timestamps
 * @returns Maximum speed in m/s
 */
export function calculateMaxSpeed(coordinates: GPSCoordinate[]): number {
  if (coordinates.length < 2) return 0

  let maxSpeed = 0
  for (let i = 1; i < coordinates.length; i++) {
    const prev = coordinates[i - 1]
    const curr = coordinates[i]
    
    const distance = calculateDistance(prev, curr)
    const timeDiff = (new Date(curr.timestamp).getTime() - new Date(prev.timestamp).getTime()) / 1000
    
    if (timeDiff > 0) {
      const speed = distance / timeDiff
      maxSpeed = Math.max(maxSpeed, speed)
    }
  }
  return maxSpeed
}

/**
 * Format distance with appropriate unit
 * @param meters Distance in meters
 * @param unit Target unit
 * @returns Formatted distance string
 */
export function formatDistance(meters: number, unit: DistanceUnit = 'kilometers'): string {
  switch (unit) {
    case 'meters':
      return `${Math.round(meters)} m`
    case 'kilometers':
      return `${(meters / 1000).toFixed(2)} km`
    case 'miles':
      return `${(meters / 1609.34).toFixed(2)} mi`
    default:
      return `${Math.round(meters)} m`
  }
}

/**
 * Format duration in human-readable format
 * @param seconds Duration in seconds
 * @returns Formatted duration string
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`
  } else {
    return `${remainingSeconds}s`
  }
}

/**
 * Format speed with appropriate unit
 * @param mps Speed in meters per second
 * @param unit Target unit
 * @returns Formatted speed string
 */
export function formatSpeed(mps: number, unit: SpeedUnit = 'kmh'): string {
  switch (unit) {
    case 'mps':
      return `${mps.toFixed(2)} m/s`
    case 'kmh':
      return `${(mps * 3.6).toFixed(2)} km/h`
    case 'mph':
      return `${(mps * 2.237).toFixed(2)} mph`
    default:
      return `${mps.toFixed(2)} m/s`
  }
}

/**
 * Check if a coordinate is within a certain radius of a target
 * @param coord Current coordinate
 * @param target Target coordinate
 * @param radius Radius in meters
 * @returns True if within radius
 */
export function isWithinRadius(coord: GPSCoordinate, target: GPSCoordinate, radius: number): boolean {
  const distance = calculateDistance(coord, target)
  return distance <= radius
}

/**
 * Generate a unique trail ID
 * @returns Unique trail ID
 */
export function generateTrailId(): string {
  return `trail_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Validate GPS coordinate
 * @param coord GPS coordinate to validate
 * @returns True if valid
 */
export function isValidCoordinate(coord: GPSCoordinate): boolean {
  return (
    typeof coord.latitude === 'number' &&
    typeof coord.longitude === 'number' &&
    coord.latitude >= -90 &&
    coord.latitude <= 90 &&
    coord.longitude >= -180 &&
    coord.longitude <= 180 &&
    typeof coord.timestamp === 'string' &&
    !isNaN(new Date(coord.timestamp).getTime())
  )
}

/**
 * Smooth GPS coordinates by removing outliers
 * @param coordinates Array of GPS coordinates
 * @param maxSpeed Maximum reasonable speed in m/s (default: 20 m/s = 72 km/h)
 * @returns Filtered coordinates
 */
export function smoothCoordinates(coordinates: GPSCoordinate[], maxSpeed: number = 20): GPSCoordinate[] {
  if (coordinates.length < 2) return coordinates

  const smoothed = [coordinates[0]]
  
  for (let i = 1; i < coordinates.length; i++) {
    const prev = smoothed[smoothed.length - 1]
    const curr = coordinates[i]
    
    const distance = calculateDistance(prev, curr)
    const timeDiff = (new Date(curr.timestamp).getTime() - new Date(prev.timestamp).getTime()) / 1000
    
    if (timeDiff > 0) {
      const speed = distance / timeDiff
      if (speed <= maxSpeed) {
        smoothed.push(curr)
      }
      // Skip outlier points that indicate unrealistic speed
    }
  }
  
  return smoothed
}
