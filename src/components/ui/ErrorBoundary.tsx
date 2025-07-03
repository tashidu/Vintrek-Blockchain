'use client'

import React from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />
      }

      return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />
    }

    return this.props.children
  }
}

interface ErrorFallbackProps {
  error?: Error
  resetError: () => void
}

function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const isBlockchainError = error?.message?.includes('blockchain') || 
                           error?.message?.includes('wallet') ||
                           error?.message?.includes('WASM')

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isBlockchainError ? 'Blockchain Connection Error' : 'Something went wrong'}
          </h1>
          <p className="text-gray-600 mb-6">
            {isBlockchainError 
              ? 'There was an issue connecting to the blockchain services. This might be due to network issues or browser compatibility.'
              : 'An unexpected error occurred. Please try refreshing the page.'}
          </p>
          
          {error && (
            <details className="mb-6 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                Technical details
              </summary>
              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                {error.message}
              </pre>
            </details>
          )}
          
          <div className="space-y-3">
            <button
              onClick={resetError}
              className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Try Again</span>
            </button>
            
            <button
              onClick={() => window.location.href = '/'}
              className="w-full flex items-center justify-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>Go Home</span>
            </button>
          </div>
          
          {isBlockchainError && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Troubleshooting Tips:</h3>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Make sure you're using a modern browser (Chrome, Firefox, Edge)</li>
                <li>• Check your internet connection</li>
                <li>• Try refreshing the page</li>
                <li>• Clear your browser cache if the issue persists</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Hook for functional components
export function useErrorHandler() {
  return (error: Error) => {
    console.error('Error caught by useErrorHandler:', error)
    // You could also send this to an error reporting service
  }
}
