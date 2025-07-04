'use client'

import { useMemo } from 'react'

// Optimized tile layer configurations for different use cases
export const getTileLayerConfig = (type: 'default' | 'satellite' | 'terrain' = 'default') => {
  const configs = {
    default: {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
      tileSize: 256,
      updateWhenIdle: false,
      updateWhenZooming: false,
      keepBuffer: 2,
      crossOrigin: true,
    },
    satellite: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
      maxZoom: 18,
      tileSize: 256,
      updateWhenIdle: false,
      updateWhenZooming: false,
      keepBuffer: 2,
      crossOrigin: true,
    },
    terrain: {
      url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://opentopomap.org/">OpenTopoMap</a>',
      maxZoom: 17,
      tileSize: 256,
      updateWhenIdle: false,
      updateWhenZooming: false,
      keepBuffer: 2,
      crossOrigin: true,
    }
  }

  return configs[type]
}

// Preload tiles for Sri Lanka region
export const preloadSriLankaTiles = () => {
  const sriLankaTiles = [
    // Central Sri Lanka tiles (zoom level 8-10)
    'https://a.tile.openstreetmap.org/8/203/127.png',
    'https://b.tile.openstreetmap.org/8/203/127.png', 
    'https://c.tile.openstreetmap.org/8/203/127.png',
    'https://a.tile.openstreetmap.org/9/406/254.png',
    'https://b.tile.openstreetmap.org/9/406/254.png',
    'https://c.tile.openstreetmap.org/9/406/254.png',
    'https://a.tile.openstreetmap.org/10/812/508.png',
    'https://b.tile.openstreetmap.org/10/812/508.png',
    'https://c.tile.openstreetmap.org/10/812/508.png',
  ]

  // Preload tiles in background
  sriLankaTiles.forEach(url => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = url
  })
}

// Optimize map bounds for Sri Lanka
export const getSriLankaBounds = () => {
  return {
    // Sri Lanka bounding box
    southWest: [5.916, 79.652] as [number, number],
    northEast: [9.835, 81.879] as [number, number],
    center: [7.8731, 80.7718] as [number, number],
    defaultZoom: 8,
    maxZoom: 18,
    minZoom: 6
  }
}
