'use client'

import { useEffect, useState, useCallback } from 'react'

interface MapPerformanceMetrics {
  loadTime: number
  tileLoadTime: number
  renderTime: number
  isLoading: boolean
}

export function useMapPerformance() {
  const [metrics, setMetrics] = useState<MapPerformanceMetrics>({
    loadTime: 0,
    tileLoadTime: 0,
    renderTime: 0,
    isLoading: true
  })

  const [startTime] = useState(() => performance.now())

  const markLoadComplete = useCallback(() => {
    const loadTime = performance.now() - startTime
    setMetrics(prev => ({
      ...prev,
      loadTime,
      isLoading: false
    }))

    // Log performance metrics for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`🗺️ Map loaded in ${loadTime.toFixed(2)}ms`)
    }
  }, [startTime])

  const markTileLoadComplete = useCallback(() => {
    const tileLoadTime = performance.now() - startTime
    setMetrics(prev => ({
      ...prev,
      tileLoadTime
    }))
  }, [startTime])

  const markRenderComplete = useCallback(() => {
    const renderTime = performance.now() - startTime
    setMetrics(prev => ({
      ...prev,
      renderTime
    }))
  }, [startTime])

  // Performance optimization: Preload critical resources
  useEffect(() => {
    // Preload Leaflet CSS if not already loaded
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'style'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      link.onload = () => {
        link.rel = 'stylesheet'
      }
      document.head.appendChild(link)
    }
  }, [])

  return {
    metrics,
    markLoadComplete,
    markTileLoadComplete,
    markRenderComplete
  }
}
