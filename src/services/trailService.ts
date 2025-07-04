'use client'

import { vinTrekBlockchainService, TrailData, GPSTrack } from '@/lib/blockchain'
import { Trail } from '@/types'

// Convert blockchain TrailData to frontend Trail type
function convertBlockchainTrailToFrontend(blockchainTrail: TrailData): Trail {
  return {
    id: blockchainTrail.id,
    name: blockchainTrail.name,
    location: blockchainTrail.location,
    difficulty: blockchainTrail.difficulty,
    duration: blockchainTrail.duration,
    distance: blockchainTrail.distance,
    price: 0, // Trails are free in VinTrek's freemium model
    rating: 4.5, // Default rating - could be calculated from user feedback
    reviews: 0, // Could be fetched from blockchain reviews
    description: blockchainTrail.description,
    image: `/images/trails/trail-${blockchainTrail.id}.jpg`, // Default image path
    features: ['GPS Tracking', 'NFT Certificate', 'TREK Rewards'],
    coordinates: blockchainTrail.coordinates,
    rewards: {
      trekTokens: blockchainTrail.rewards.trekTokens,
      nftCertificate: blockchainTrail.rewards.nftCertificate,
      experiencePoints: blockchainTrail.rewards.trekTokens * 10
    },
    isPremiumOnly: blockchainTrail.difficulty === 'Expert', // Expert trails require premium
    createdBy: blockchainTrail.createdBy,
    verified: blockchainTrail.verified,
    createdAt: blockchainTrail.createdAt,
    txHash: blockchainTrail.txHash
  }
}

// Fallback mock data for when blockchain is not available
const fallbackTrails: Trail[] = [
  {
    id: 'ella-rock-001',
    name: 'Ella Rock Trail',
    location: 'Ella, Sri Lanka',
    difficulty: 'Moderate',
    duration: '4-5 hours',
    distance: '8 km',
    price: 0,
    rating: 4.8,
    reviews: 156,
    description: 'A scenic hike through tea plantations leading to breathtaking views of Ella Gap and the surrounding mountains.',
    image: '/images/trails/ella-rock.jpg',
    features: ['GPS Tracking', 'NFT Certificate', 'TREK Rewards'],
    coordinates: [
      { lat: 6.8667, lng: 81.0500 },
      { lat: 6.8700, lng: 81.0520 },
      { lat: 6.8750, lng: 81.0550 }
    ],
    rewards: {
      trekTokens: 50,
      nftCertificate: true,
      experiencePoints: 500
    },
    isPremiumOnly: false,
    createdBy: 'system',
    verified: true,
    createdAt: Date.now() - 86400000 // 1 day ago
  },
  {
    id: 'adams-peak-002',
    name: 'Adams Peak (Sri Pada)',
    location: 'Ratnapura, Sri Lanka',
    difficulty: 'Hard',
    duration: '6-8 hours',
    distance: '12 km',
    price: 0,
    rating: 4.9,
    reviews: 234,
    description: 'Sacred mountain pilgrimage with stunning sunrise views. Challenging night hike to reach the summit.',
    image: '/images/trails/adams-peak.jpg',
    features: ['GPS Tracking', 'NFT Certificate', 'TREK Rewards', 'Night Hiking'],
    coordinates: [
      { lat: 6.8094, lng: 80.4992 },
      { lat: 6.8100, lng: 80.5000 },
      { lat: 6.8110, lng: 80.5010 }
    ],
    rewards: {
      trekTokens: 100,
      nftCertificate: true,
      experiencePoints: 1000
    },
    isPremiumOnly: false,
    createdBy: 'system',
    verified: true,
    createdAt: Date.now() - 172800000 // 2 days ago
  },
  {
    id: 'sigiriya-003',
    name: 'Sigiriya Rock Fortress',
    location: 'Dambulla, Sri Lanka',
    difficulty: 'Moderate',
    duration: '3-4 hours',
    distance: '5 km',
    price: 0,
    rating: 4.7,
    reviews: 189,
    description: 'Ancient rock fortress with historical significance and panoramic views of the surrounding landscape.',
    image: '/images/trails/sigiriya.jpg',
    features: ['GPS Tracking', 'NFT Certificate', 'TREK Rewards', 'Historical Site'],
    coordinates: [
      { lat: 7.9568, lng: 80.7603 },
      { lat: 7.9570, lng: 80.7605 },
      { lat: 7.9575, lng: 80.7610 }
    ],
    rewards: {
      trekTokens: 75,
      nftCertificate: true,
      experiencePoints: 750
    },
    isPremiumOnly: true, // Premium trail
    createdBy: 'system',
    verified: true,
    createdAt: Date.now() - 259200000 // 3 days ago
  },
  {
    id: 'hidden-waterfall-004',
    name: 'Hidden Waterfall Trail',
    location: 'Kandy, Sri Lanka',
    difficulty: 'Moderate',
    duration: '3-4 hours',
    distance: '6.8 km',
    price: 0,
    rating: 4.6,
    reviews: 42,
    description: 'A beautiful hidden waterfall discovered by local hikers. This trail leads through dense forest to a stunning 40-meter waterfall with natural swimming pools.',
    image: '/images/trails/hidden-waterfall.jpg',
    features: ['GPS Tracking', 'NFT Certificate', 'TREK Rewards', 'Waterfall', 'Swimming'],
    coordinates: [
      { lat: 7.2906, lng: 80.6337 },
      { lat: 7.2926, lng: 80.6357 },
      { lat: 7.2956, lng: 80.6387 }
    ],
    rewards: {
      trekTokens: 40,
      nftCertificate: true,
      experiencePoints: 400
    },
    isPremiumOnly: false,
    isUserContributed: true,
    contributedBy: 'addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3n0d3vllmyqwsx5wktcd8cc3sq835lu7drv2xwl2wywfgse35a3x',
    contributedByName: 'Hiking_Explorer_LK',
    createdBy: 'user',
    verified: true,
    createdAt: Date.now() - 86400000 // 1 day ago
  }
]

export class TrailService {
  private useBlockchain: boolean = false // Force fallback data for testing

  constructor() {
    // Check if blockchain is available
    this.checkBlockchainAvailability()
  }

  private async checkBlockchainAvailability(): Promise<void> {
    try {
      // Test if we can connect to Blockfrost API
      const response = await fetch('https://cardano-testnet.blockfrost.io/api/v0/health', {
        headers: {
          'project_id': process.env.NEXT_PUBLIC_BLOCKFROST_PROJECT_ID || 'test'
        }
      })
      this.useBlockchain = response.ok
    } catch (error) {
      console.warn('Blockchain not available, using fallback data:', error)
      this.useBlockchain = false
    }
  }

  // Get all trails (from blockchain or fallback)
  async getTrails(): Promise<Trail[]> {
    try {
      if (this.useBlockchain) {
        console.log('🔗 Fetching trails from Cardano blockchain...')
        const blockchainTrails = await vinTrekBlockchainService.getTrailsFromChain()
        
        if (blockchainTrails.length > 0) {
          console.log(`✅ Found ${blockchainTrails.length} trails on blockchain`)
          return blockchainTrails.map(convertBlockchainTrailToFrontend)
        } else {
          console.log('📝 No trails found on blockchain, using fallback data')
          console.log('Fallback trails count:', fallbackTrails.length)
          console.log('User contributed trails:', fallbackTrails.filter(t => t.isUserContributed))
          return fallbackTrails
        }
      } else {
        console.log('💾 Using fallback trail data (blockchain unavailable)')
        console.log('Fallback trails count:', fallbackTrails.length)
        console.log('User contributed trails:', fallbackTrails.filter(t => t.isUserContributed))
        return fallbackTrails
      }
    } catch (error) {
      console.error('Error fetching trails:', error)
      console.log('💾 Falling back to mock data due to error')
      return fallbackTrails
    }
  }

  // Get trail by ID
  async getTrailById(trailId: string): Promise<Trail | null> {
    try {
      if (this.useBlockchain) {
        const blockchainTrail = await vinTrekBlockchainService.getTrailById(trailId)
        if (blockchainTrail) {
          return convertBlockchainTrailToFrontend(blockchainTrail)
        }
      }
      
      // Fallback to mock data
      return fallbackTrails.find(trail => trail.id === trailId) || null
    } catch (error) {
      console.error('Error fetching trail by ID:', error)
      return fallbackTrails.find(trail => trail.id === trailId) || null
    }
  }

  // Store new trail on blockchain
  async storeTrail(trailData: Omit<TrailData, 'txHash'>): Promise<string> {
    if (!this.useBlockchain) {
      throw new Error('Blockchain not available for storing trails')
    }

    try {
      console.log('🔗 Storing trail on Cardano blockchain...')
      const txHash = await vinTrekBlockchainService.storeTrailOnChain(trailData)
      console.log('✅ Trail stored successfully:', txHash)
      return txHash
    } catch (error) {
      console.error('Error storing trail on blockchain:', error)
      throw error
    }
  }

  // Store GPS track on blockchain
  async storeGPSTrack(gpsTrack: Omit<GPSTrack, 'txHash'>): Promise<string> {
    if (!this.useBlockchain) {
      throw new Error('Blockchain not available for storing GPS tracks')
    }

    try {
      console.log('🔗 Storing GPS track on Cardano blockchain...')
      const txHash = await vinTrekBlockchainService.storeGPSTrack(gpsTrack)
      console.log('✅ GPS track stored successfully:', txHash)
      return txHash
    } catch (error) {
      console.error('Error storing GPS track on blockchain:', error)
      throw error
    }
  }

  // Get user's GPS tracks
  async getUserGPSTracks(userAddress: string): Promise<GPSTrack[]> {
    try {
      if (this.useBlockchain) {
        return await vinTrekBlockchainService.getGPSTracksByUser(userAddress)
      }
      return []
    } catch (error) {
      console.error('Error fetching user GPS tracks:', error)
      return []
    }
  }

  // Verify trail completion and reward tokens
  async completeTrail(trailId: string, gpsTrack: GPSTrack): Promise<{ verified: boolean; rewardTxHash?: string }> {
    try {
      if (!this.useBlockchain) {
        throw new Error('Blockchain not available for trail completion')
      }

      console.log('🔗 Verifying trail completion on blockchain...')
      const verified = await vinTrekBlockchainService.verifyTrailCompletion(trailId, gpsTrack)
      
      if (verified && gpsTrack.userAddress) {
        console.log('✅ Trail completion verified, rewarding TREK tokens...')
        const rewardTxHash = await vinTrekBlockchainService.rewardTrekTokens(trailId, gpsTrack.userAddress, gpsTrack)
        return { verified: true, rewardTxHash }
      }

      return { verified }
    } catch (error) {
      console.error('Error completing trail:', error)
      throw error
    }
  }
}

// Export singleton instance
export const trailService = new TrailService()
