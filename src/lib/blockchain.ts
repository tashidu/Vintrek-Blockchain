// Dynamic imports for client-side only
let BrowserWallet: any = null
let Transaction: any = null
let AssetMetadata: any = null
let meshLoaded = false

const loadMeshSDK = async () => {
  if (typeof window !== 'undefined' && !meshLoaded) {
    try {
      const meshModule = await import('@meshsdk/core')
      BrowserWallet = meshModule.BrowserWallet
      Transaction = meshModule.Transaction
      AssetMetadata = meshModule.AssetMetadata
      meshLoaded = true
      console.log('Mesh SDK loaded successfully')
    } catch (error) {
      console.error('Failed to load Mesh SDK:', error)
    }
  }
}

// Initialize on client side
if (typeof window !== 'undefined') {
  loadMeshSDK()
}

// Blockchain configuration
export const BLOCKCHAIN_CONFIG = {
  network: process.env.NEXT_PUBLIC_CARDANO_NETWORK || 'testnet',
  blockfrostApiKey: process.env.NEXT_PUBLIC_BLOCKFROST_PROJECT_ID || '',
  blockfrostUrl: process.env.NEXT_PUBLIC_BLOCKFROST_API_URL || 'https://cardano-testnet.blockfrost.io/api/v0',
  nftPolicyId: process.env.NEXT_PUBLIC_NFT_POLICY_ID || '',
  tokenPolicyId: process.env.NEXT_PUBLIC_TOKEN_POLICY_ID || '',
  scriptAddress: process.env.NEXT_PUBLIC_SCRIPT_ADDRESS || '',
}

// Trail NFT metadata structure
export interface TrailNFTMetadata {
  name: string
  description: string
  image: string
  attributes: {
    trail_name: string
    location: string
    difficulty: string
    completion_date: string
    coordinates: string
    hiker_address: string
  }
}

// TREK Token configuration
export const TREK_TOKEN = {
  symbol: 'TREK',
  decimals: 6,
  policyId: BLOCKCHAIN_CONFIG.tokenPolicyId,
  assetName: '54524b', // 'TRK' in hex
}

// Blockchain service class
export class BlockchainService {
  private wallet: any | null = null

  constructor(wallet: any | null = null) {
    this.wallet = wallet
  }

  setWallet(wallet: any) {
    this.wallet = wallet
  }

  // Check if Mesh SDK is loaded and ready
  async ensureSDKLoaded(): Promise<boolean> {
    if (typeof window === 'undefined') return false

    if (!meshLoaded) {
      await loadMeshSDK()
    }

    return meshLoaded && BrowserWallet && Transaction && AssetMetadata
  }

  // Get wallet balance in ADA
  async getWalletBalance(): Promise<string> {
    if (!this.wallet || typeof window === 'undefined') throw new Error('Wallet not connected')

    const sdkReady = await this.ensureSDKLoaded()
    if (!sdkReady) throw new Error('Blockchain SDK not loaded')

    try {
      const balance = await this.wallet.getBalance()
      return balance
    } catch (error) {
      console.error('Error fetching wallet balance:', error)
      throw error
    }
  }

  // Get wallet assets (NFTs and tokens)
  async getWalletAssets(): Promise<any[]> {
    if (!this.wallet) throw new Error('Wallet not connected')
    
    try {
      const assets = await this.wallet.getAssets()
      return assets
    } catch (error) {
      console.error('Error fetching wallet assets:', error)
      throw error
    }
  }

  // Get TREK token balance
  async getTrekTokenBalance(): Promise<number> {
    try {
      const assets = await this.getWalletAssets()
      const trekAsset = assets.find(asset => 
        asset.unit.startsWith(TREK_TOKEN.policyId)
      )
      
      if (trekAsset) {
        return parseInt(trekAsset.quantity) / Math.pow(10, TREK_TOKEN.decimals)
      }
      
      return 0
    } catch (error) {
      console.error('Error fetching TREK token balance:', error)
      return 0
    }
  }

  // Get trail NFTs owned by wallet
  async getTrailNFTs(): Promise<any[]> {
    try {
      const assets = await this.getWalletAssets()
      const nfts = assets.filter(asset => 
        asset.unit.startsWith(BLOCKCHAIN_CONFIG.nftPolicyId) && 
        asset.quantity === '1'
      )
      
      // Fetch metadata for each NFT
      const nftsWithMetadata = await Promise.all(
        nfts.map(async (nft) => {
          try {
            const metadata = await this.fetchNFTMetadata(nft.unit)
            return { ...nft, metadata }
          } catch (error) {
            console.error(`Error fetching metadata for NFT ${nft.unit}:`, error)
            return { ...nft, metadata: null }
          }
        })
      )
      
      return nftsWithMetadata
    } catch (error) {
      console.error('Error fetching trail NFTs:', error)
      return []
    }
  }

  // Fetch NFT metadata from blockchain
  async fetchNFTMetadata(assetId: string): Promise<TrailNFTMetadata | null> {
    try {
      const response = await fetch(
        `${BLOCKCHAIN_CONFIG.blockfrostUrl}/assets/${assetId}`,
        {
          headers: {
            'project_id': BLOCKCHAIN_CONFIG.blockfrostApiKey,
          },
        }
      )
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const assetData = await response.json()
      
      if (assetData.onchain_metadata) {
        return assetData.onchain_metadata as TrailNFTMetadata
      }
      
      return null
    } catch (error) {
      console.error('Error fetching NFT metadata:', error)
      return null
    }
  }

  // Create booking transaction
  async createBookingTransaction(trailId: string, amount: number, date: string): Promise<string> {
    if (!this.wallet || typeof window === 'undefined' || !Transaction) throw new Error('Wallet not connected or Transaction not available')

    try {
      const walletAddress = await this.wallet.getChangeAddress()

      // Create booking metadata
      const bookingMetadata = {
        trail_id: trailId,
        booking_date: date,
        amount: amount,
        timestamp: new Date().toISOString(),
        hiker_address: walletAddress,
      }

      // Build transaction (simplified - in production, this would interact with smart contracts)
      const tx = new Transaction({ initiator: this.wallet })
      
      // Add metadata to transaction
      tx.setMetadata(674, bookingMetadata)
      
      // Send payment to script address (or trail operator)
      tx.sendLovelace(
        BLOCKCHAIN_CONFIG.scriptAddress,
        (amount * 1000000).toString() // Convert ADA to Lovelace
      )
      
      const unsignedTx = await tx.build()
      const signedTx = await this.wallet.signTx(unsignedTx)
      const txHash = await this.wallet.submitTx(signedTx)
      
      return txHash
    } catch (error) {
      console.error('Error creating booking transaction:', error)
      throw error
    }
  }

  // Mint trail completion NFT
  async mintTrailNFT(trailData: {
    trailName: string
    location: string
    difficulty: string
    coordinates: string
  }): Promise<string> {
    if (!this.wallet || typeof window === 'undefined' || !Transaction) throw new Error('Wallet not connected or Transaction not available')
    
    try {
      const walletAddress = await this.wallet.getChangeAddress()
      const completionDate = new Date().toISOString()
      
      // Create NFT metadata
      const metadata: TrailNFTMetadata = {
        name: `${trailData.trailName} Completion Certificate`,
        description: `Proof of completion for ${trailData.trailName} trail in ${trailData.location}`,
        image: `ipfs://QmTrailNFTImage${Date.now()}`, // In production, upload to IPFS
        attributes: {
          trail_name: trailData.trailName,
          location: trailData.location,
          difficulty: trailData.difficulty,
          completion_date: completionDate,
          coordinates: trailData.coordinates,
          hiker_address: walletAddress,
        }
      }
      
      // Generate unique asset name
      const assetName = `VinTrekNFT${Date.now()}`
      
      // Build minting transaction (simplified)
      const tx = new Transaction({ initiator: this.wallet })
      
      // Add minting logic here (requires smart contract integration)
      // This is a placeholder - actual implementation would use Mesh SDK's minting functions
      
      const unsignedTx = await tx.build()
      const signedTx = await this.wallet.signTx(unsignedTx)
      const txHash = await this.wallet.submitTx(signedTx)
      
      return txHash
    } catch (error) {
      console.error('Error minting trail NFT:', error)
      throw error
    }
  }

  // Mint TREK tokens as rewards
  async mintTrekTokens(amount: number, reason: string): Promise<string> {
    if (!this.wallet || typeof window === 'undefined' || !Transaction) throw new Error('Wallet not connected or Transaction not available')
    
    try {
      const walletAddress = await this.wallet.getChangeAddress()
      
      // Create reward metadata
      const rewardMetadata = {
        recipient: walletAddress,
        amount: amount,
        reason: reason,
        timestamp: new Date().toISOString(),
      }
      
      // Build token minting transaction (simplified)
      const tx = new Transaction({ initiator: this.wallet })
      
      // Add metadata
      tx.setMetadata(674, rewardMetadata)
      
      // Add token minting logic here (requires smart contract integration)
      
      const unsignedTx = await tx.build()
      const signedTx = await this.wallet.signTx(unsignedTx)
      const txHash = await this.wallet.submitTx(signedTx)
      
      return txHash
    } catch (error) {
      console.error('Error minting TREK tokens:', error)
      throw error
    }
  }

  // Verify transaction on blockchain
  async verifyTransaction(txHash: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${BLOCKCHAIN_CONFIG.blockfrostUrl}/txs/${txHash}`,
        {
          headers: {
            'project_id': BLOCKCHAIN_CONFIG.blockfrostApiKey,
          },
        }
      )
      
      if (response.ok) {
        const txData = await response.json()
        return txData.block !== null // Transaction is confirmed if it's in a block
      }
      
      return false
    } catch (error) {
      console.error('Error verifying transaction:', error)
      return false
    }
  }
}

// Utility functions
export const formatLovelaceToAda = (lovelace: string): number => {
  return parseInt(lovelace) / 1000000
}

export const formatAdaToLovelace = (ada: number): string => {
  return (ada * 1000000).toString()
}

export const generateAssetName = (prefix: string): string => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substr(2, 9)
  return `${prefix}${timestamp}${random}`
}

// Trail data interfaces for blockchain storage
export interface TrailData {
  id: string
  name: string
  location: string
  coordinates: { lat: number; lng: number }[]
  difficulty: 'Easy' | 'Moderate' | 'Hard' | 'Expert'
  distance: string
  duration: string
  description: string
  rewards: {
    trekTokens: number
    nftCertificate: boolean
  }
  createdBy: string
  verified: boolean
  createdAt: number
  txHash?: string // Transaction hash where trail data is stored
}

export interface GPSTrack {
  trailId: string
  userAddress: string
  coordinates: { lat: number; lng: number; timestamp: number; altitude?: number }[]
  startTime: number
  endTime: number
  totalDistance: number
  completionVerified: boolean
  txHash?: string
}

// Extend BlockchainService with trail data storage
export class VinTrekBlockchainService extends BlockchainService {

  // Store trail data on Cardano blockchain using transaction metadata
  async storeTrailOnChain(trailData: TrailData): Promise<string> {
    if (!this.wallet || typeof window === 'undefined' || !Transaction) {
      throw new Error('Wallet not connected or Transaction not available')
    }

    try {
      const walletAddress = await this.wallet.getChangeAddress()

      // Create transaction with trail metadata
      const tx = new Transaction({ initiator: this.wallet })

      // Store trail data as transaction metadata (label 674 for VinTrek)
      tx.setMetadata(674, {
        action: 'store_trail',
        version: '1.0',
        trail: {
          id: trailData.id,
          name: trailData.name,
          location: trailData.location,
          coordinates: trailData.coordinates.slice(0, 10), // Limit coordinates for metadata size
          difficulty: trailData.difficulty,
          distance: trailData.distance,
          duration: trailData.duration,
          description: trailData.description.substring(0, 300), // Limit description size
          rewards: trailData.rewards,
          createdBy: walletAddress,
          verified: false, // Will be verified by validators
          createdAt: Date.now()
        }
      })

      // Send small ADA amount to script address to store data
      if (BLOCKCHAIN_CONFIG.scriptAddress) {
        tx.sendLovelace(BLOCKCHAIN_CONFIG.scriptAddress, '2000000') // 2 ADA
      }

      const unsignedTx = await tx.build()
      const signedTx = await this.wallet.signTx(unsignedTx)
      const txHash = await this.wallet.submitTx(signedTx)

      console.log('Trail stored on blockchain:', txHash)
      return txHash
    } catch (error) {
      console.error('Error storing trail on chain:', error)
      throw error
    }
  }

  // Store GPS track data on blockchain
  async storeGPSTrack(gpsTrack: GPSTrack): Promise<string> {
    if (!this.wallet || typeof window === 'undefined' || !Transaction) {
      throw new Error('Wallet not connected or Transaction not available')
    }

    try {
      const walletAddress = await this.wallet.getChangeAddress()

      const tx = new Transaction({ initiator: this.wallet })

      // Store GPS track as metadata
      tx.setMetadata(674, {
        action: 'store_gps_track',
        version: '1.0',
        track: {
          trailId: gpsTrack.trailId,
          userAddress: walletAddress,
          startTime: gpsTrack.startTime,
          endTime: gpsTrack.endTime,
          totalDistance: gpsTrack.totalDistance,
          coordinatesCount: gpsTrack.coordinates.length,
          // Store compressed coordinates (every 10th point to save space)
          coordinates: gpsTrack.coordinates.filter((_, index) => index % 10 === 0),
          completionVerified: gpsTrack.completionVerified
        }
      })

      // Send small amount to record the track
      if (BLOCKCHAIN_CONFIG.scriptAddress) {
        tx.sendLovelace(BLOCKCHAIN_CONFIG.scriptAddress, '1500000') // 1.5 ADA
      }

      const unsignedTx = await tx.build()
      const signedTx = await this.wallet.signTx(unsignedTx)
      const txHash = await this.wallet.submitTx(signedTx)

      console.log('GPS track stored on blockchain:', txHash)
      return txHash
    } catch (error) {
      console.error('Error storing GPS track on chain:', error)
      throw error
    }
  }

  // Retrieve trails from blockchain using Blockfrost API
  async getTrailsFromChain(): Promise<TrailData[]> {
    try {
      if (!BLOCKCHAIN_CONFIG.blockfrostApiKey) {
        console.warn('Blockfrost API key not configured, returning empty trails')
        return []
      }

      // Query transactions with VinTrek metadata label (674)
      const response = await fetch(
        `${BLOCKCHAIN_CONFIG.blockfrostUrl}/metadata/txs/labels/674`,
        {
          headers: {
            'project_id': BLOCKCHAIN_CONFIG.blockfrostApiKey,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const metadataList = await response.json()
      const trails: TrailData[] = []

      // Process each metadata entry
      for (const metadata of metadataList) {
        try {
          const txResponse = await fetch(
            `${BLOCKCHAIN_CONFIG.blockfrostUrl}/txs/${metadata.tx_hash}/metadata`,
            {
              headers: {
                'project_id': BLOCKCHAIN_CONFIG.blockfrostApiKey,
              },
            }
          )

          if (txResponse.ok) {
            const txMetadata = await txResponse.json()
            const vintrekData = txMetadata.find((m: any) => m.label === '674')

            if (vintrekData && vintrekData.json_metadata?.action === 'store_trail') {
              const trailData = vintrekData.json_metadata.trail
              trails.push({
                ...trailData,
                txHash: metadata.tx_hash
              })
            }
          }
        } catch (error) {
          console.error(`Error processing metadata for tx ${metadata.tx_hash}:`, error)
        }
      }

      return trails.sort((a, b) => b.createdAt - a.createdAt) // Sort by newest first
    } catch (error) {
      console.error('Error retrieving trails from blockchain:', error)
      return []
    }
  }

  // Get specific trail by ID from blockchain
  async getTrailById(trailId: string): Promise<TrailData | null> {
    try {
      const trails = await this.getTrailsFromChain()
      return trails.find(trail => trail.id === trailId) || null
    } catch (error) {
      console.error('Error getting trail by ID:', error)
      return null
    }
  }

  // Get GPS tracks for a specific user
  async getGPSTracksByUser(userAddress: string): Promise<GPSTrack[]> {
    try {
      if (!BLOCKCHAIN_CONFIG.blockfrostApiKey) {
        console.warn('Blockfrost API key not configured, returning empty tracks')
        return []
      }

      const response = await fetch(
        `${BLOCKCHAIN_CONFIG.blockfrostUrl}/metadata/txs/labels/674`,
        {
          headers: {
            'project_id': BLOCKCHAIN_CONFIG.blockfrostApiKey,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const metadataList = await response.json()
      const tracks: GPSTrack[] = []

      for (const metadata of metadataList) {
        try {
          const txResponse = await fetch(
            `${BLOCKCHAIN_CONFIG.blockfrostUrl}/txs/${metadata.tx_hash}/metadata`,
            {
              headers: {
                'project_id': BLOCKCHAIN_CONFIG.blockfrostApiKey,
              },
            }
          )

          if (txResponse.ok) {
            const txMetadata = await txResponse.json()
            const vintrekData = txMetadata.find((m: any) => m.label === '674')

            if (vintrekData &&
                vintrekData.json_metadata?.action === 'store_gps_track' &&
                vintrekData.json_metadata?.track?.userAddress === userAddress) {
              const trackData = vintrekData.json_metadata.track
              tracks.push({
                ...trackData,
                txHash: metadata.tx_hash
              })
            }
          }
        } catch (error) {
          console.error(`Error processing GPS track metadata for tx ${metadata.tx_hash}:`, error)
        }
      }

      return tracks.sort((a, b) => b.endTime - a.endTime) // Sort by newest first
    } catch (error) {
      console.error('Error retrieving GPS tracks from blockchain:', error)
      return []
    }
  }

  // Verify trail completion based on GPS data
  async verifyTrailCompletion(trailId: string, gpsTrack: GPSTrack): Promise<boolean> {
    try {
      const trail = await this.getTrailById(trailId)
      if (!trail) {
        console.error('Trail not found for verification')
        return false
      }

      // Basic verification logic
      const minDistance = parseFloat(trail.distance.replace(/[^\d.]/g, '')) * 0.8 // 80% of trail distance
      const completionThreshold = minDistance * 1000 // Convert to meters

      // Check if GPS track covers sufficient distance
      if (gpsTrack.totalDistance >= completionThreshold) {
        // Additional verification: check if track follows trail coordinates
        const trailCoords = trail.coordinates
        const trackCoords = gpsTrack.coordinates

        // Simple proximity check (in production, use more sophisticated algorithms)
        let proximityMatches = 0
        for (const trailPoint of trailCoords) {
          for (const trackPoint of trackCoords) {
            const distance = this.calculateDistance(
              trailPoint.lat, trailPoint.lng,
              trackPoint.lat, trackPoint.lng
            )
            if (distance < 100) { // Within 100 meters
              proximityMatches++
              break
            }
          }
        }

        const proximityRatio = proximityMatches / trailCoords.length
        return proximityRatio >= 0.6 // 60% of trail points should be matched
      }

      return false
    } catch (error) {
      console.error('Error verifying trail completion:', error)
      return false
    }
  }

  // Calculate distance between two GPS coordinates (Haversine formula)
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180
    const φ2 = lat2 * Math.PI/180
    const Δφ = (lat2-lat1) * Math.PI/180
    const Δλ = (lon2-lon1) * Math.PI/180

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

    return R * c // Distance in meters
  }

  // Reward TREK tokens for trail completion
  async rewardTrekTokens(trailId: string, userAddress: string, gpsTrack: GPSTrack): Promise<string> {
    if (!this.wallet || typeof window === 'undefined' || !Transaction) {
      throw new Error('Wallet not connected or Transaction not available')
    }

    try {
      const trail = await this.getTrailById(trailId)
      if (!trail) {
        throw new Error('Trail not found')
      }

      const isVerified = await this.verifyTrailCompletion(trailId, gpsTrack)
      if (!isVerified) {
        throw new Error('Trail completion not verified')
      }

      const rewardAmount = trail.rewards.trekTokens

      const tx = new Transaction({ initiator: this.wallet })

      // Record reward transaction
      tx.setMetadata(674, {
        action: 'reward_trek_tokens',
        version: '1.0',
        reward: {
          trailId: trailId,
          recipient: userAddress,
          amount: rewardAmount,
          reason: 'trail_completion',
          trailName: trail.name,
          completionDate: new Date().toISOString(),
          gpsTrackTxHash: gpsTrack.txHash
        }
      })

      // In production, this would mint actual TREK tokens
      // For now, we record the reward transaction
      if (BLOCKCHAIN_CONFIG.scriptAddress) {
        tx.sendLovelace(BLOCKCHAIN_CONFIG.scriptAddress, '1000000') // 1 ADA
      }

      const unsignedTx = await tx.build()
      const signedTx = await this.wallet.signTx(unsignedTx)
      const txHash = await this.wallet.submitTx(signedTx)

      console.log('TREK tokens rewarded:', txHash)
      return txHash
    } catch (error) {
      console.error('Error rewarding TREK tokens:', error)
      throw error
    }
  }
}

// Export enhanced blockchain service instance
export const vinTrekBlockchainService = new VinTrekBlockchainService()

// Keep backward compatibility
export const blockchainService = vinTrekBlockchainService
