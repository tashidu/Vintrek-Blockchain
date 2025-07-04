'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { useWallet } from '@/components/providers/WalletProvider'
import { hybridDataService } from '@/services/hybridDataService'
import { CompletedTrail, UserTrailStats } from '@/types/trail'
import {
  Trophy,
  MapPin,
  Clock,
  Navigation,
  Coins,
  Shield,
  RefreshCw,
  Database,
  Link,
  CheckCircle,
  AlertCircle,
  Calendar
} from 'lucide-react'

export default function HybridDashboard() {
  const { address, connected } = useWallet()
  const [completedTrails, setCompletedTrails] = useState<CompletedTrail[]>([])
  const [accessHistory, setAccessHistory] = useState<any[]>([])
  const [stats, setStats] = useState<UserTrailStats | null>(null)
  const [syncStatus, setSyncStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    if (connected && address) {
      loadDashboardData()
      loadSyncStatus()
    }
  }, [connected, address])

  const loadDashboardData = async () => {
    if (!address) return

    try {
      setLoading(true)
      
      // Load data from hybrid service (cache first, blockchain fallback)
      const [trails, trailAccess, userStats] = await Promise.all([
        hybridDataService.getUserTrailHistory(address),
        hybridDataService.getTrailAccessHistory(address),
        hybridDataService.getUserStats(address)
      ])

      setCompletedTrails(trails)
      setAccessHistory(trailAccess)
      setStats(userStats)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSyncStatus = async () => {
    try {
      const status = await hybridDataService.getSyncStatus()
      setSyncStatus(status)
    } catch (error) {
      console.error('Error loading sync status:', error)
    }
  }

  const handleSyncWithBlockchain = async () => {
    if (!address) return

    try {
      setSyncing(true)
      const result = await hybridDataService.syncWithBlockchain(address)
      
      if (result.success) {
        await loadDashboardData()
        await loadSyncStatus()
      }
    } catch (error) {
      console.error('Sync failed:', error)
    } finally {
      setSyncing(false)
    }
  }

  const formatDistance = (meters: number) => {
    return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${meters} m`
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  }

  if (!connected) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Connect Wallet</CardTitle>
          <CardDescription>
            Please connect your Cardano wallet to view your VinTrek dashboard
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header with Sync Status */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">VinTrek Dashboard</h1>
          <p className="text-muted-foreground">Hybrid Blockchain + Local Storage</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Sync Status Indicator */}
          <div className="flex items-center gap-2">
            {syncStatus?.status === 'synced' && (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">Synced</span>
              </>
            )}
            {syncStatus?.status === 'syncing' && (
              <>
                <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
                <span className="text-sm text-blue-600">Syncing...</span>
              </>
            )}
            {syncStatus?.status === 'error' && (
              <>
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-600">Sync Error</span>
              </>
            )}
          </div>

          <Button 
            onClick={handleSyncWithBlockchain} 
            disabled={syncing}
            variant="outline"
            size="sm"
          >
            {syncing ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Link className="h-4 w-4 mr-2" />
            )}
            Sync Blockchain
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Trails</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalTrails || 0}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Database className="h-3 w-3" />
              Local Cache
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Distance</CardTitle>
            <Navigation className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDistance(stats?.totalDistance || 0)}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Database className="h-3 w-3" />
              Calculated Locally
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">TREK Tokens</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.trekTokensEarned || 0}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Link className="h-3 w-3" />
              Blockchain Verified
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">NFTs Minted</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.nftsMinted || 0}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Link className="h-3 w-3" />
              On-Chain Assets
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="trails" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trails">Completed Trails</TabsTrigger>
          <TabsTrigger value="access">Trail Access</TabsTrigger>
          <TabsTrigger value="architecture">Data Architecture</TabsTrigger>
        </TabsList>

        <TabsContent value="trails" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trail Completions</CardTitle>
              <CardDescription>
                Your hiking achievements stored in hybrid architecture
              </CardDescription>
            </CardHeader>
            <CardContent>
              {completedTrails.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No completed trails yet. Start your first adventure!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {completedTrails.map((trail) => (
                    <div key={trail.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{trail.name}</h3>
                          <Badge variant={trail.verified ? "default" : "secondary"}>
                            {trail.verified ? (
                              <>
                                <Link className="h-3 w-3 mr-1" />
                                Verified
                              </>
                            ) : (
                              <>
                                <Database className="h-3 w-3 mr-1" />
                                Local
                              </>
                            )}
                          </Badge>
                          <Badge variant="outline">{trail.difficulty}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Navigation className="h-3 w-3" />
                            {formatDistance(trail.distance)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDuration(trail.duration)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Coins className="h-3 w-3" />
                            {trail.trekTokensEarned} TREK
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                          {new Date(trail.completedAt).toLocaleDateString()}
                        </div>
                        {trail.nftMinted && (
                          <Badge variant="secondary" className="mt-1">
                            <Shield className="h-3 w-3 mr-1" />
                            NFT Minted
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trail Access History</CardTitle>
              <CardDescription>
                Your trail access sessions - VinTrek provides free access to all trails
              </CardDescription>
            </CardHeader>
            <CardContent>
              {accessHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No trail access recorded yet. Start exploring!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {accessHistory.slice(0, 10).map((access, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">Trail: {access.trailId}</h3>
                          <Badge variant="secondary">
                            <MapPin className="h-3 w-3 mr-1" />
                            Free Access
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Accessed: {new Date(access.accessedAt).toLocaleDateString()}</span>
                          <span>Session: {access.sessionId}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">
                          <Database className="h-3 w-3 mr-1" />
                          Local Record
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="architecture" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>VinTrek Hybrid Architecture</CardTitle>
              <CardDescription>
                How we balance blockchain immutability with performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    Stored on Cardano Blockchain
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Trail completion proofs
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      TREK token rewards
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Achievement verification
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      NFT minting records
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      GPS verification data
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Cached Locally
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-blue-500" />
                      Full GPS routes
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-blue-500" />
                      User preferences
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-blue-500" />
                      Trail photos & notes
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-blue-500" />
                      Statistics & leaderboards
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-blue-500" />
                      Quick access data
                    </li>
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Benefits of Hybrid Approach:</h4>
                <ul className="text-sm space-y-1">
                  <li>• <strong>Fast UI:</strong> Instant loading from local cache</li>
                  <li>• <strong>Immutable Proof:</strong> Critical data verified on blockchain</li>
                  <li>• <strong>Cost Effective:</strong> Only important events cost gas fees</li>
                  <li>• <strong>Offline Support:</strong> Works without constant blockchain connection</li>
                  <li>• <strong>Data Recovery:</strong> Can sync from blockchain if local data is lost</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
