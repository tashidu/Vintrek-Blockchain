'use client'

import { useState } from 'react'
import { Mountain, Coins, Trophy, Gift, Star, Users, MessageSquare } from 'lucide-react'

export default function RewardsPage() {
  const [selectedTab, setSelectedTab] = useState('earn')

  const earnRewards = [
    {
      icon: Mountain,
      title: 'Complete Trails',
      description: 'Earn 50 TREK tokens for each trail you complete',
      reward: '50 TREK',
      color: 'green'
    },
    {
      icon: MessageSquare,
      title: 'Submit Reviews',
      description: 'Share your experience and earn tokens for helpful reviews',
      reward: '10 TREK',
      color: 'blue'
    },
    {
      icon: Users,
      title: 'Invite Friends',
      description: 'Bring friends to VinTrek and earn bonus rewards',
      reward: '100 TREK',
      color: 'purple'
    },
    {
      icon: Star,
      title: 'Special Events',
      description: 'Participate in seasonal events and challenges',
      reward: 'Variable',
      color: 'yellow'
    }
  ]

  const redeemOptions = [
    {
      title: 'Premium Membership',
      description: 'Unlock exclusive trails, offline maps, and AR experiences',
      cost: '300 TREK',
      duration: '1 month',
      features: ['Exclusive trails', 'Offline maps', 'AR experiences', 'Priority support']
    },
    {
      title: 'Trail Gear Discount',
      description: 'Get 20% off hiking gear from partner stores',
      cost: '150 TREK',
      duration: 'One-time use',
      features: ['20% discount', 'Partner stores', 'Valid for 30 days']
    },
    {
      title: 'Campsite Booking Credit',
      description: 'Credit towards your next campsite booking',
      cost: '200 TREK',
      duration: 'One-time use',
      features: ['₨1000 credit', 'Any campsite', 'Valid for 60 days']
    }
  ]

  const getIconColor = (color: string) => {
    switch (color) {
      case 'green': return 'text-green-600 bg-green-100'
      case 'blue': return 'text-blue-600 bg-blue-100'
      case 'purple': return 'text-purple-600 bg-purple-100'
      case 'yellow': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
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
              <a href="/trails" className="text-gray-700 hover:text-green-600 transition-colors">Trails</a>
              <a href="/dashboard" className="text-gray-700 hover:text-green-600 transition-colors">Dashboard</a>
              <a href="/rewards" className="text-green-600 font-medium">Rewards</a>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">TREK Token Rewards</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Earn TREK tokens for your outdoor adventures and redeem them for exclusive benefits, 
            gear discounts, and premium features.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-md">
            <button
              onClick={() => setSelectedTab('earn')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                selectedTab === 'earn'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Earn Rewards
            </button>
            <button
              onClick={() => setSelectedTab('redeem')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                selectedTab === 'redeem'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Redeem Tokens
            </button>
          </div>
        </div>

        {/* Earn Rewards Tab */}
        {selectedTab === 'earn' && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Earn TREK Tokens</h2>
              <p className="text-gray-600">
                Complete activities and engage with the VinTrek community to earn tokens
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {earnRewards.map((reward, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-full ${getIconColor(reward.color)}`}>
                      <reward.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{reward.title}</h3>
                      <p className="text-gray-600 mb-3">{reward.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Reward:</span>
                        <span className="font-semibold text-green-600">{reward.reward}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Token Economy Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">About TREK Tokens</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <Coins className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">Utility Token</h4>
                  <p className="text-sm text-gray-600">
                    TREK is a fungible utility token built on Cardano blockchain
                  </p>
                </div>
                <div className="text-center">
                  <Trophy className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">Earn & Trade</h4>
                  <p className="text-sm text-gray-600">
                    Earn tokens through activities or trade on Cardano DEXs
                  </p>
                </div>
                <div className="text-center">
                  <Gift className="h-12 w-12 text-purple-500 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">Real Value</h4>
                  <p className="text-sm text-gray-600">
                    Redeem for premium features, discounts, and exclusive content
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Redeem Tokens Tab */}
        {selectedTab === 'redeem' && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Redeem Your TREK Tokens</h2>
              <p className="text-gray-600">
                Use your earned tokens to unlock premium features and exclusive benefits
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {redeemOptions.map((option, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{option.title}</h3>
                    <p className="text-gray-600 mb-4">{option.description}</p>
                    <div className="text-2xl font-bold text-green-600 mb-1">{option.cost}</div>
                    <div className="text-sm text-gray-500">{option.duration}</div>
                  </div>
                  
                  <div className="space-y-2 mb-6">
                    {option.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                  
                  <button 
                    type="button"
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                    onClick={() => alert('Redemption feature coming soon! Connect your wallet to enable token redemption.')}
                  >
                    Redeem Now
                  </button>
                </div>
              ))}
            </div>

            {/* Trading Info */}
            <div className="mt-8 bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Trade TREK Tokens</h3>
              <p className="text-gray-600 mb-4">
                TREK tokens are tradeable on Cardano decentralized exchanges. Current market value: approximately $0.067 per token.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  type="button"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => window.open('https://minswap.org', '_blank')}
                >
                  Trade on Minswap
                </button>
                <button 
                  type="button"
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  onClick={() => window.open('https://sundaeswap.finance', '_blank')}
                >
                  Trade on SundaeSwap
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
