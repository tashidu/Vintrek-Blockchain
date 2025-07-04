'use client'

import { useEffect } from 'react'

// Preload Leaflet CSS and core libraries
export function MapPreloader() {
  useEffect(() => {
    // Preload Leaflet CSS
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
    link.crossOrigin = ''
    document.head.appendChild(link)

    // Preload critical map tiles for Sri Lanka region
    const preloadTiles = [
      'https://a.tile.openstreetmap.org/8/203/127.png', // Sri Lanka center
      'https://b.tile.openstreetmap.org/8/203/127.png',
      'https://c.tile.openstreetmap.org/8/203/127.png',
    ]

    preloadTiles.forEach(url => {
      const img = new Image()
      img.src = url
    })

    // Preload Leaflet library
    import('leaflet').catch(() => {
      // Silently fail if preload doesn't work
    })

    return () => {
      // Cleanup if needed
      const existingLink = document.querySelector('link[href*="leaflet.css"]')
      if (existingLink && existingLink.parentNode) {
        existingLink.parentNode.removeChild(existingLink)
      }
    }
  }, [])

  return null // This component doesn't render anything
}
