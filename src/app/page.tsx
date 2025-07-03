'use client'

import { useState } from 'react'
import { Mountain, Wallet, MapPin, Trophy, Coins, Users } from 'lucide-react'
import { WalletConnect } from '@/components/wallet/WalletConnect'
import { TrailCard } from '@/components/trails/TrailCard'
import { StatsCard } from '@/components/ui/StatsCard'

// Mock data for demonstration
const featuredTrails = [
  {
    id: '1',
    name: 'Ella Rock Trail',
    location: 'Ella, Sri Lanka',
    difficulty: 'Moderate',
    distance: '8.2 km',
    duration: '4-5 hours',
    image: '/api/placeholder/400/300',
    description: 'A scenic hike offering panoramic views of the hill country.',
    price: 2500,
    available: true,
  },
  {
    id: '2',
    name: 'Adam\'s Peak',
    location: 'Ratnapura, Sri Lanka',
    difficulty: 'Hard',
    distance: '11.5 km',
    duration: '6-8 hours',
    image: '/api/placeholder/400/300',
    description: 'Sacred mountain with breathtaking sunrise views.',
    price: 3500,
    available: true,
  },
  {
    id: '3',
    name: 'Horton Plains',
    location: 'Nuwara Eliya, Sri Lanka',
    difficulty: 'Easy',
    distance: '9.5 km',
    duration: '3-4 hours',
    image: '/api/placeholder/400/300',
    description: 'UNESCO World Heritage site with World\'s End viewpoint.',
    price: 4000,
    available: false,
  },
]

const stats = [
  { icon: Mountain, label: 'Trails Available', value: '150+' },
  { icon: Users, label: 'Active Hikers', value: '2.5K+' },
  { icon: Trophy, label: 'NFTs Minted', value: '1.2K+' },
  { icon: Coins, label: 'TREK Tokens Earned', value: '50K+' },
]

export default function HomePage() {
  const [isConnected, setIsConnected] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Mountain className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">VinTrek</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="/trails" className="text-gray-700 hover:text-green-600 transition-colors">Trails</a>
              <a href="/record" className="text-gray-700 hover:text-green-600 transition-colors">Record</a>
              <a href="/dashboard" className="text-gray-700 hover:text-green-600 transition-colors">Dashboard</a>
              <a href="/rewards" className="text-gray-700 hover:text-green-600 transition-colors">Rewards</a>
              <a href="#" className="text-gray-700 hover:text-green-600 transition-colors">Community</a>
            </nav>
            <WalletConnect onConnectionChange={setIsConnected} />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Explore Sri Lanka's Trails,
            <span className="text-green-600 block">Earn Blockchain Rewards</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover breathtaking hiking trails, mint unique NFTs upon completion, 
            and earn TREK tokens for your eco-tourism adventures.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              type="button"
              onClick={() => window.location.href = '/trails'}
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Explore Trails
            </button>
            <button
              type="button"
              onClick={() => window.location.href = '/demo'}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              View Demo
            </button>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: document.getElementById('how-it-works')?.offsetTop || 0, behavior: 'smooth' })}
              className="border border-green-600 text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <StatsCard key={index} {...stat} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Trails */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Trails</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our most popular hiking destinations and start your blockchain-powered adventure today.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredTrails.map((trail) => (
              <TrailCard key={trail.id} trail={trail} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How VinTrek Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Experience the future of eco-tourism with blockchain technology
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Discover & Book</h3>
              <p className="text-gray-600">Browse trails, check availability, and book your adventure with your Cardano wallet.</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mountain className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Complete Trail</h3>
              <p className="text-gray-600">Hike the trail, enjoy nature, and verify completion via GPS or manual confirmation.</p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Earn Rewards</h3>
              <p className="text-gray-600">Mint unique trail NFTs and earn TREK tokens for completing adventures and activities.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Mountain className="h-6 w-6" />
                <span className="text-xl font-bold">VinTrek</span>
              </div>
              <p className="text-gray-400">
                Blockchain-powered eco-tourism platform for Sri Lanka's beautiful trails.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Trails</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Dashboard</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Rewards</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Blockchain</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">NFT Collection</a></li>
                <li><a href="#" className="hover:text-white transition-colors">TREK Token</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Wallet Guide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Smart Contracts</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 VinTrek. All rights reserved. Built on Cardano blockchain.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
