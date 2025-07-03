'use client'

import { useState } from 'react'
import { Mountain, ArrowLeft, Trophy, Coins, MapPin, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useWallet } from '@/components/providers/WalletProvider'
import { useTrailData } from '@/hooks/useTrailData'
import { formatDistance, formatDuration } from '@/lib/trailUtils'

export default function DashboardPage() {
  const { connected } = useWallet()
  const { 
    completedTrails, 
    userStats, 
    recordings
  } = useTrailData()
  
  const [activeTab, setActiveTab] = useState<'overview' | 'trails' | 'recordings' | 'achievements'>('overview')

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center space-x-2">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
                <Mountain className="h-8 w-8 text-green-600" />
                <span className="text-2xl font-bold text-gray-900">VinTrek</span>
              </Link>
            </div>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <Mountain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Wallet Required</h2>
            <p className="text-gray-600 mb-6">
              Please connect your Cardano wallet to view your trail dashboard.
            </p>
            <Link
              href="/"
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors inline-block"
            >
              Connect Wallet
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
              <Mountain className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">VinTrek</span>
            </Link>
            <div className="text-sm text-gray-600">
              Dashboard
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Trail Dashboard</h1>
          <p className="text-gray-600">
            Track your progress and view your hiking achievements
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: TrendingUp },
                { id: 'trails', label: 'Completed Trails', icon: Mountain },
                { id: 'recordings', label: 'Recordings', icon: MapPin },
                { id: 'achievements', label: 'Achievements', icon: Trophy },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Mountain className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Total Trails</span>
                    </div>
                    <div className="text-2xl font-bold text-green-900">{userStats.totalTrails}</div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Distance</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-900">
                      {formatDistance(userStats.totalDistance)}
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Trophy className="h-5 w-5 text-purple-600" />
                      <span className="text-sm font-medium text-purple-800">Time</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-900">
                      {formatDuration(userStats.totalDuration)}
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Coins className="h-5 w-5 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">TREK Tokens</span>
                    </div>
                    <div className="text-2xl font-bold text-yellow-900">{userStats.trekTokensEarned}</div>
                  </div>
                </div>

                {/* Recent Trails */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Trails</h3>
                  {completedTrails.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Mountain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No completed trails yet</p>
                      <Link
                        href="/record"
                        className="text-green-600 hover:text-green-700 font-medium"
                      >
                        Start your first trail →
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {completedTrails.slice(0, 5).map((trail) => (
                        <div key={trail.id} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{trail.name}</h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>{formatDistance(trail.distance)}</span>
                              <span>{formatDuration(trail.duration)}</span>
                              <span className="capitalize">{trail.difficulty}</span>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(trail.completedAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'trails' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Completed Trails ({completedTrails.length})
                </h3>
                {completedTrails.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Mountain className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg mb-2">No completed trails yet</p>
                    <p className="mb-4">Start recording your first trail to see it here</p>
                    <Link
                      href="/record"
                      className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors inline-block"
                    >
                      Record Trail
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {completedTrails.map((trail) => (
                      <div key={trail.id} className="bg-gray-50 rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">{trail.name}</h4>
                            <p className="text-gray-600">{trail.location}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              trail.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                              trail.difficulty === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                              trail.difficulty === 'Hard' ? 'bg-orange-100 text-orange-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {trail.difficulty}
                            </span>
                            {trail.nftMinted && (
                              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                                NFT Minted
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Distance</span>
                            <div className="font-semibold">{formatDistance(trail.distance)}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Duration</span>
                            <div className="font-semibold">{formatDuration(trail.duration)}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">TREK Tokens</span>
                            <div className="font-semibold">{trail.trekTokensEarned}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Completed</span>
                            <div className="font-semibold">
                              {new Date(trail.completedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        
                        {trail.notes && (
                          <div className="mt-4 p-3 bg-white rounded border">
                            <div className="text-sm text-gray-600">Notes</div>
                            <div className="text-sm">{trail.notes}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'recordings' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Trail Recordings ({recordings.length})
                </h3>
                {recordings.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <MapPin className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg mb-2">No recordings found</p>
                    <p className="mb-4">Your trail recordings will appear here</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {recordings.map((recording) => (
                      <div key={recording.id} className="bg-gray-50 rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">{recording.name}</h4>
                            {recording.description && (
                              <p className="text-gray-600">{recording.description}</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              recording.isActive ? 'bg-red-100 text-red-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {recording.isActive ? 'Active' : 'Completed'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Distance</span>
                            <div className="font-semibold">{formatDistance(recording.totalDistance)}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Duration</span>
                            <div className="font-semibold">{formatDuration(recording.totalDuration)}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Points</span>
                            <div className="font-semibold">{recording.coordinates.length}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Started</span>
                            <div className="font-semibold">
                              {new Date(recording.startTime).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'achievements' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Achievements ({userStats.achievements.length})
                </h3>
                {userStats.achievements.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Trophy className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg mb-2">No achievements yet</p>
                    <p className="mb-4">Complete trails to unlock achievements</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {userStats.achievements.map((achievement) => (
                      <div key={achievement.id} className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center">
                            <Trophy className="h-6 w-6 text-yellow-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-yellow-900">{achievement.name}</h4>
                            <p className="text-sm text-yellow-700">{achievement.description}</p>
                            <p className="text-xs text-yellow-600 capitalize">{achievement.category}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
