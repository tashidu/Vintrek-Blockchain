'use client'

import { useState, useEffect } from 'react'
import { Wallet, RefreshCw, AlertCircle, CheckCircle, XCircle } from 'lucide-react'

export function WalletDebug() {
  const [walletInfo, setWalletInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const checkWallets = () => {
    setIsLoading(true)
    
    setTimeout(() => {
      if (typeof window === 'undefined') {
        setWalletInfo({ error: 'Not in browser environment' })
        setIsLoading(false)
        return
      }

      const info = {
        timestamp: new Date().toISOString(),
        hasCardano: !!window.cardano,
        cardanoKeys: window.cardano ? Object.keys(window.cardano) : [],
        wallets: {} as any,
        userAgent: navigator.userAgent,
        errors: [] as string[]
      }

      if (window.cardano) {
        // Check each potential wallet
        const walletNames = ['lace', 'eternl', 'nami', 'flint', 'typhon', 'gerowallet', 'ccvault', 'yoroi']
        
        walletNames.forEach(name => {
          if (window.cardano![name]) {
            try {
              const wallet = window.cardano![name]
              info.wallets[name] = {
                exists: true,
                name: wallet.name || 'Unknown',
                icon: wallet.icon || 'No icon',
                apiVersion: wallet.apiVersion || 'Unknown',
                isEnabled: typeof wallet.isEnabled === 'function' ? wallet.isEnabled() : 'Unknown',
                supportedExtensions: wallet.supportedExtensions || []
              }
            } catch (error) {
              info.wallets[name] = {
                exists: true,
                error: error instanceof Error ? error.message : 'Unknown error'
              }
            }
          } else {
            info.wallets[name] = { exists: false }
          }
        })
      } else {
        info.errors.push('window.cardano is not available')
      }

      setWalletInfo(info)
      setIsLoading(false)
    }, 500)
  }

  useEffect(() => {
    checkWallets()
  }, [])

  const testWalletConnection = async (walletName: string) => {
    if (!window.cardano || !window.cardano[walletName]) {
      alert(`${walletName} wallet not found`)
      return
    }

    try {
      console.log(`Testing connection to ${walletName}...`)
      const api = await window.cardano[walletName].enable()
      console.log('Connection successful:', api)
      
      // Test basic API calls
      try {
        const networkId = await api.getNetworkId()
        console.log('Network ID:', networkId)
      } catch (e) {
        console.warn('Could not get network ID:', e)
      }

      try {
        const balance = await api.getBalance()
        console.log('Balance:', balance)
      } catch (e) {
        console.warn('Could not get balance:', e)
      }

      try {
        const addresses = await api.getUsedAddresses()
        console.log('Used addresses:', addresses)
      } catch (e) {
        console.warn('Could not get addresses:', e)
      }

      alert(`${walletName} connection test successful! Check console for details.`)
    } catch (error) {
      console.error('Connection test failed:', error)
      alert(`${walletName} connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
          <Wallet className="h-6 w-6" />
          <span>Wallet Debug Tool</span>
        </h2>
        <button
          onClick={checkWallets}
          disabled={isLoading}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Checking wallets...</p>
        </div>
      ) : walletInfo ? (
        <div className="space-y-6">
          {/* Environment Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Environment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div>Timestamp: {new Date(walletInfo.timestamp).toLocaleString()}</div>
              <div>Has Cardano: {walletInfo.hasCardano ? '✅' : '❌'}</div>
              <div className="md:col-span-2">
                Browser: {walletInfo.userAgent.includes('Chrome') ? 'Chrome' : 
                         walletInfo.userAgent.includes('Firefox') ? 'Firefox' : 
                         walletInfo.userAgent.includes('Safari') ? 'Safari' : 'Other'}
              </div>
            </div>
          </div>

          {/* Cardano Object Info */}
          {walletInfo.hasCardano && (
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Cardano Object</h3>
              <div className="text-sm">
                <div>Available keys: {walletInfo.cardanoKeys.join(', ') || 'None'}</div>
              </div>
            </div>
          )}

          {/* Wallet Details */}
          <div>
            <h3 className="font-semibold mb-4">Wallet Detection Results</h3>
            <div className="grid gap-4">
              {Object.entries(walletInfo.wallets).map(([name, info]: [string, any]) => (
                <div key={name} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {info.exists ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className="font-medium capitalize">{name}</span>
                    </div>
                    {info.exists && !info.error && (
                      <button
                        onClick={() => testWalletConnection(name)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                      >
                        Test Connection
                      </button>
                    )}
                  </div>
                  
                  {info.exists ? (
                    info.error ? (
                      <div className="text-red-600 text-sm">Error: {info.error}</div>
                    ) : (
                      <div className="text-sm space-y-1">
                        <div>Name: {info.name}</div>
                        <div>API Version: {info.apiVersion}</div>
                        <div>Enabled: {info.isEnabled?.toString() || 'Unknown'}</div>
                      </div>
                    )
                  ) : (
                    <div className="text-gray-500 text-sm">Not installed</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Errors */}
          {walletInfo.errors.length > 0 && (
            <div className="bg-red-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span>Errors</span>
              </h3>
              <ul className="text-sm text-red-700 space-y-1">
                {walletInfo.errors.map((error: string, index: number) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Instructions</h3>
            <div className="text-sm space-y-2">
              <p>1. Install a Cardano wallet extension (Lace, Eternl, Nami, etc.)</p>
              <p>2. Refresh this page after installation</p>
              <p>3. Use "Test Connection" to verify wallet functionality</p>
              <p>4. Check browser console for detailed logs</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          Click refresh to check wallet status
        </div>
      )}
    </div>
  )
}
