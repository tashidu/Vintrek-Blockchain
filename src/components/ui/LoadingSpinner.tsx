'use client'

import { useState, useEffect } from 'react'
import { Mountain } from 'lucide-react'

interface LoadingSpinnerProps {
  message?: string
  showLogo?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ 
  message = 'Loading...', 
  showLogo = false, 
  size = 'md',
  className = '' 
}: LoadingSpinnerProps) {
  const [dots, setDots] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.')
    }, 500)

    return () => clearInterval(interval)
  }, [])

  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  }

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      {showLogo && (
        <div className="flex items-center space-x-2 mb-4">
          <Mountain className="h-8 w-8 text-green-600" />
          <span className="text-2xl font-bold text-gray-900">VinTrek</span>
        </div>
      )}
      
      <div className={`animate-spin rounded-full border-b-2 border-green-600 ${sizeClasses[size]}`}></div>
      
      <div className="text-center">
        <p className="text-gray-600 font-medium">{message}{dots}</p>
        <p className="text-sm text-gray-500 mt-1">
          Connecting to blockchain services
        </p>
      </div>
    </div>
  )
}

// Blockchain-specific loading component
export function BlockchainLoadingSpinner({ message = 'Initializing blockchain connection' }: { message?: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <LoadingSpinner 
          message={message}
          showLogo={true}
          size="lg"
          className="py-8"
        />
        
        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Loading Cardano SDK</span>
            <div className="animate-pulse w-4 h-4 bg-green-200 rounded-full"></div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Connecting to Blockfrost</span>
            <div className="animate-pulse w-4 h-4 bg-blue-200 rounded-full"></div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Preparing wallet interface</span>
            <div className="animate-pulse w-4 h-4 bg-purple-200 rounded-full"></div>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            This may take a few moments on first load
          </p>
        </div>
      </div>
    </div>
  )
}
