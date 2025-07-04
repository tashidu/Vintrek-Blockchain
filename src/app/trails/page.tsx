'use client'

import { useState, useEffect } from 'react'
import { MapPin, Filter, Search, Mountain } from 'lucide-react'
import { TrailCard } from '@/components/trails/TrailCard'
import { LoadingSpinner, BlockchainLoadingSpinner } from '@/components/ui/LoadingSpinner'
import { BlockchainVerification } from '@/components/blockchain/BlockchainVerification'
import { PremiumStatus } from '@/components/premium/PremiumStatus'
import { Trail } from '@/types'
import { trailService } from '@/services/trailService'

// Note: Trail data now comes from Cardano blockchain via trailService
// Fallback data is handled within the service
// Mock data removed - now using blockchain-based trail service

export default function TrailsPage() {
  const [trails, setTrails] = useState<Trail[]>([])
  const [filteredTrails, setFilteredTrails] = useState<Trail[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('')
  const [selectedLocation, setSelectedLocation] = useState<string>('')
  const [showAvailableOnly, setShowAvailableOnly] = useState(false)
  const [sortBy, setSortBy] = useState<string>('name')
  const [isLoading, setIsLoading] = useState(true)
  const [blockchainLoading, setBlockchainLoading] = useState(false)

  // Get unique locations and difficulties for filters
  const locations = Array.from(new Set(trails.map(trail => trail.location.split(',')[1]?.trim() || trail.location)))
  const difficulties = Array.from(new Set(trails.map(trail => trail.difficulty)))

  useEffect(() => {
    filterAndSortTrails()
  }, [searchQuery, selectedDifficulty, selectedLocation, showAvailableOnly, sortBy])

  // Load trails from blockchain service
  useEffect(() => {
    const loadTrails = async () => {
      try {
        setIsLoading(true)
        setBlockchainLoading(true)

        console.log('🔗 Loading trails from blockchain service...')
        const loadedTrails = await trailService.getTrails()

        // Add multi-route trail for testing
        const multiRouteTrail: Trail = {
          id: 'hidden-waterfall-004',
          name: 'Hidden Waterfall Trail',
          location: 'Kandy, Sri Lanka',
          difficulty: 'Moderate',
          distance: '6.8 km',
          duration: '3-4 hours',
          description: 'A beautiful hidden waterfall discovered by local hikers. Multiple routes available with different difficulty levels and scenic viewpoints.',
          price: 0,
          available: true,
          image: '/images/trails/hidden-waterfall.jpg',
          features: ['GPS Tracking', 'NFT Certificate', 'TREK Rewards', 'Waterfall', 'Swimming'],
          maxCapacity: 25,
          currentBookings: 8,
          isUserContributed: true,
          contributedBy: 'addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3n0d3vllmyqwsx5wktcd8cc3sq835lu7drv2xwl2wywfgse35a3x',
          contributedByName: 'Hiking_Explorer_LK',
          isPremiumOnly: false,
          routes: [
            {
              id: 'route-main',
              name: 'Main Route',
              description: 'The original route discovered by the community. Well-marked path through forest.',
              difficulty: 'Moderate',
              distance: '6.8 km',
              duration: '3-4 hours',
              gpsRoute: [
                { lat: 7.2906, lng: 80.6337 },
                { lat: 7.2926, lng: 80.6357 },
                { lat: 7.2956, lng: 80.6387 }
              ],
              startPoint: { lat: 7.2906, lng: 80.6337 },
              endPoint: { lat: 7.2956, lng: 80.6387 },
              elevationGain: 320,
              contributedBy: 'addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3n0d3vllmyqwsx5wktcd8cc3sq835lu7drv2xwl2wywfgse35a3x',
              contributedByName: 'Hiking_Explorer_LK',
              isUserContributed: true,
              verified: true,
              createdAt: Date.now() - 86400000
            },
            {
              id: 'route-scenic',
              name: 'Scenic Route',
              description: 'Longer route with panoramic viewpoints. Added by local guide for photography enthusiasts.',
              difficulty: 'Moderate',
              distance: '8.2 km',
              duration: '4-5 hours',
              gpsRoute: [
                { lat: 7.2906, lng: 80.6337 },
                { lat: 7.2916, lng: 80.6347 },
                { lat: 7.2936, lng: 80.6367 },
                { lat: 7.2956, lng: 80.6387 }
              ],
              startPoint: { lat: 7.2906, lng: 80.6337 },
              endPoint: { lat: 7.2956, lng: 80.6387 },
              elevationGain: 450,
              contributedBy: 'addr1qy3gxv8umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3n0d3vllmyqwsx5wktcd8cc3sq835lu7drv2xwl2wywfgse35b4y',
              contributedByName: 'Nature_Guide_SL',
              isUserContributed: true,
              verified: true,
              createdAt: Date.now() - 43200000
            },
            {
              id: 'route-easy',
              name: 'Easy Access Route',
              description: 'Shorter, easier path suitable for families. Recently added by community.',
              difficulty: 'Easy',
              distance: '4.5 km',
              duration: '2-3 hours',
              gpsRoute: [
                { lat: 7.2916, lng: 80.6347 },
                { lat: 7.2946, lng: 80.6377 },
                { lat: 7.2956, lng: 80.6387 }
              ],
              startPoint: { lat: 7.2916, lng: 80.6347 },
              endPoint: { lat: 7.2956, lng: 80.6387 },
              elevationGain: 180,
              contributedBy: 'addr1qz4hxw9vmzitulyzxq9x1emqeu4l7dxoh6qyk4kitzeer4o1e4wmmzrxwty6wlued9dd4tr946mv8drw3ywm3xzwgfte36c5z',
              contributedByName: 'Family_Hiker_22',
              isUserContributed: true,
              verified: true,
              createdAt: Date.now() - 21600000
            }
          ],
          defaultRouteId: 'route-main'
        }

        const allTrails = [...loadedTrails, multiRouteTrail]
        console.log(`✅ Loaded ${allTrails.length} trails (including user-contributed)`)
        setTrails(allTrails)
        setFilteredTrails(allTrails)
        setTrails(loadedTrails)
        setFilteredTrails(loadedTrails)

      } catch (error) {
        console.error('❌ Error loading trails:', error)
        // Fallback will be handled by trailService
        setTrails([])
        setFilteredTrails([])
      } finally {
        setIsLoading(false)
        setBlockchainLoading(false)
      }
    }

    loadTrails()
  }, [])

  const filterAndSortTrails = () => {
    let filtered = trails.filter(trail => {
      const matchesSearch = trail.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           trail.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           trail.description.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesDifficulty = !selectedDifficulty || trail.difficulty === selectedDifficulty
      const matchesLocation = !selectedLocation || trail.location.includes(selectedLocation)
      const matchesAvailability = !showAvailableOnly || trail.available
      
      return matchesSearch && matchesDifficulty && matchesLocation && matchesAvailability
    })

    // Sort trails
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price - b.price
        case 'difficulty':
          const difficultyOrder = { 'Easy': 1, 'Moderate': 2, 'Hard': 3 }
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
        case 'distance':
          return parseFloat(a.distance) - parseFloat(b.distance)
        default:
          return a.name.localeCompare(b.name)
      }
    })

    setFilteredTrails(filtered)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedDifficulty('')
    setSelectedLocation('')
    setShowAvailableOnly(false)
    setSortBy('name')
  }

  // Show loading screen while initializing
  if (isLoading) {
    return (
      <BlockchainLoadingSpinner
        message={blockchainLoading ? "🔗 Fetching trails from Cardano blockchain..." : "Loading VinTrek trails..."}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => window.location.href = '/'}
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
              >
                <Mountain className="h-8 w-8 text-green-600" />
                <span className="text-2xl font-bold text-gray-900">VinTrek</span>
              </button>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="/" className="text-gray-700 hover:text-green-600 transition-colors">Home</a>
              <a href="/trails" className="text-green-600 font-medium">Trails</a>
              <a href="/dashboard" className="text-gray-700 hover:text-green-600 transition-colors">Dashboard</a>
              <a href="/rewards" className="text-gray-700 hover:text-green-600 transition-colors">Rewards</a>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover Sri Lankan Trails</h1>
          <p className="text-gray-600">Explore breathtaking hiking trails and earn blockchain rewards for your adventures.</p>
        </div>

        {/* Blockchain & Premium Status */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <BlockchainVerification />
          <PremiumStatus />
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search trails..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Difficulty Filter */}
            <div>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Difficulties</option>
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>{difficulty}</option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Locations</option>
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="name">Sort by Name</option>
                <option value="price">Sort by Price</option>
                <option value="difficulty">Sort by Difficulty</option>
                <option value="distance">Sort by Distance</option>
              </select>
            </div>

            {/* Available Only Toggle */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="available-only"
                checked={showAvailableOnly}
                onChange={(e) => setShowAvailableOnly(e.target.checked)}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <label htmlFor="available-only" className="text-sm text-gray-700">
                Available only
              </label>
            </div>
          </div>

          {/* Clear Filters */}
          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {filteredTrails.length} of {trails.length} trails
            </p>
            <button
              onClick={clearFilters}
              className="text-sm text-green-600 hover:text-green-700 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        </div>

        {/* Trails Grid */}
        {filteredTrails.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No trails found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters.</p>
            <button
              onClick={clearFilters}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTrails.map((trail) => (
              <TrailCard key={trail.id} trail={trail} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
