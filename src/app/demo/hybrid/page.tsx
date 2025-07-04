'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import HybridDashboard from '@/components/dashboard/HybridDashboard'
import TrailCompletionHandler from '@/components/trail/TrailCompletionHandler'
import {
  Database,
  Link,
  Zap,
  Shield,
  Users,
  TrendingUp,
  CheckCircle,
  Clock,
  Coins
} from 'lucide-react'

// Mock GPS data for demo
const mockGPSData = Array.from({ length: 120 }, (_, i) => ({
  lat: 6.8721 + (i * 0.0001),
  lng: 81.0462 + (i * 0.0001),
  timestamp: new Date(Date.now() - (120 - i) * 30000).toISOString()
}))

export default function HybridArchitectureDemo() {
  const [activeDemo, setActiveDemo] = useState<'overview' | 'completion' | 'dashboard'>('overview')

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            VinTrek Hybrid Architecture Demo
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Experience how we combine Cardano blockchain immutability with local storage performance 
            for the ultimate eco-tourism platform
          </p>
        </div>

        {/* Architecture Overview */}
        <Card className="border-2 border-dashed border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Why Hybrid Architecture?
            </CardTitle>
            <CardDescription>
              The perfect balance between decentralization and user experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Pure Blockchain */}
              <div className="p-4 border rounded-lg bg-purple-50">
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <Link className="h-4 w-4 text-purple-600" />
                  Pure Blockchain
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Fully decentralized</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Immutable proof</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-red-500" />
                    <span>Slow queries</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Coins className="h-3 w-3 text-red-500" />
                    <span>Expensive writes</span>
                  </div>
                </div>
              </div>

              {/* Hybrid Approach */}
              <div className="p-4 border-2 border-green-500 rounded-lg bg-green-50">
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <Zap className="h-4 w-4 text-green-600" />
                  VinTrek Hybrid ✨
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Fast UI responses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Blockchain verification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Free trail access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Offline support</span>
                  </div>
                </div>
              </div>

              {/* Traditional Database */}
              <div className="p-4 border rounded-lg bg-blue-50">
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <Database className="h-4 w-4 text-blue-600" />
                  Traditional Database
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Very fast</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Complex queries</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-red-500" />
                    <span>Centralized</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-3 w-3 text-red-500" />
                    <span>Trust required</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Flow Diagram */}
        <Card>
          <CardHeader>
            <CardTitle>VinTrek Data Flow</CardTitle>
            <CardDescription>
              How data moves through our hybrid architecture
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-sm font-medium">User Action</p>
                <p className="text-xs text-muted-foreground">Complete Trail</p>
              </div>

              <div className="text-center">
                <div className="w-4 h-0.5 bg-gray-300 mx-auto mb-8"></div>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Database className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-sm font-medium">Local Cache</p>
                <p className="text-xs text-muted-foreground">Instant UI</p>
              </div>

              <div className="text-center">
                <div className="w-4 h-0.5 bg-gray-300 mx-auto mb-8"></div>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Link className="h-8 w-8 text-purple-600" />
                </div>
                <p className="text-sm font-medium">Blockchain</p>
                <p className="text-xs text-muted-foreground">Immutable Proof</p>
              </div>

              <div className="text-center">
                <div className="w-4 h-0.5 bg-gray-300 mx-auto mb-8"></div>
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Shield className="h-8 w-8 text-yellow-600" />
                </div>
                <p className="text-sm font-medium">Verification</p>
                <p className="text-xs text-muted-foreground">Update Cache</p>
              </div>

              <div className="text-center">
                <div className="w-4 h-0.5 bg-gray-300 mx-auto mb-8"></div>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-sm font-medium">Dashboard</p>
                <p className="text-xs text-muted-foreground">Fast Display</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Interactive Demo</CardTitle>
            <CardDescription>
              Try the hybrid architecture in action
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeDemo} onValueChange={(value) => setActiveDemo(value as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Architecture Overview</TabsTrigger>
                <TabsTrigger value="completion">Trail Completion</TabsTrigger>
                <TabsTrigger value="dashboard">User Dashboard</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-blue-500" />
                        Local Storage Layer
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Trail completions</span>
                        <Badge variant="secondary">Cached</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>User preferences</span>
                        <Badge variant="secondary">Cached</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>GPS routes</span>
                        <Badge variant="secondary">Cached</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Statistics</span>
                        <Badge variant="secondary">Calculated</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Link className="h-4 w-4 text-purple-500" />
                        Blockchain Layer
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Completion proofs</span>
                        <Badge variant="default">On-Chain</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>TREK rewards</span>
                        <Badge variant="default">On-Chain</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>NFT minting</span>
                        <Badge variant="default">On-Chain</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Achievement verification</span>
                        <Badge variant="default">On-Chain</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                  <h3 className="font-semibold mb-4">Benefits for Hackathon Judges</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ul className="space-y-2 text-sm">
                      <li>• <strong>Innovation:</strong> Novel hybrid approach to blockchain UX</li>
                      <li>• <strong>Scalability:</strong> Handles thousands of users efficiently</li>
                      <li>• <strong>User Experience:</strong> Instant responses, no waiting for blockchain</li>
                    </ul>
                    <ul className="space-y-2 text-sm">
                      <li>• <strong>Free Access:</strong> No booking fees or reservations needed</li>
                      <li>• <strong>Reliability:</strong> Works offline, syncs when online</li>
                      <li>• <strong>Verifiable:</strong> All achievements provable on Cardano</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="completion" className="space-y-6">
                <TrailCompletionHandler
                  trailId="ella-rock-demo"
                  trailName="Ella Rock Trail (Demo)"
                  location="Ella, Sri Lanka"
                  difficulty="Moderate"
                  gpsData={mockGPSData}
                  distance={8200}
                  duration={14400}
                  onComplete={() => {
                    console.log('Demo trail completed!')
                    setActiveDemo('dashboard')
                  }}
                />
              </TabsContent>

              <TabsContent value="dashboard" className="space-y-6">
                <HybridDashboard />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Technical Implementation */}
        <Card>
          <CardHeader>
            <CardTitle>Technical Implementation</CardTitle>
            <CardDescription>
              How we built the hybrid architecture
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold">Frontend (Next.js)</h3>
                <ul className="text-sm space-y-1">
                  <li>• React components with TypeScript</li>
                  <li>• Local storage service for caching</li>
                  <li>• Mesh SDK for Cardano integration</li>
                  <li>• Real-time sync status indicators</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold">Blockchain (Cardano)</h3>
                <ul className="text-sm space-y-1">
                  <li>• Transaction metadata for proofs</li>
                  <li>• Smart contracts for NFT minting</li>
                  <li>• TREK token rewards system</li>
                  <li>• Immutable trail completions</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold">Data Sync</h3>
                <ul className="text-sm space-y-1">
                  <li>• Hybrid data service coordination</li>
                  <li>• Automatic cache invalidation</li>
                  <li>• Blockchain fallback queries</li>
                  <li>• Conflict resolution strategies</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
          <CardContent className="text-center py-8">
            <h2 className="text-2xl font-bold mb-4">Ready to Experience VinTrek?</h2>
            <p className="mb-6 opacity-90">
              Connect your Cardano wallet and start exploring Sri Lanka's trails with blockchain-verified achievements
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="secondary" size="lg">
                Connect Wallet
              </Button>
              <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-green-600">
                View Trails
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
