// Trail Types
export interface TrailCoordinate {
  lat: number
  lng: number
  elevation?: number
  timestamp?: string
}

export interface TrailRoute {
  id: string
  name: string // e.g., "Main Route", "Scenic Route", "Advanced Path"
  description: string
  difficulty: 'Easy' | 'Moderate' | 'Hard'
  distance: string
  duration: string
  gpsRoute: TrailCoordinate[]
  startPoint: TrailCoordinate
  endPoint: TrailCoordinate
  elevationGain?: number
  // Route contribution info
  contributedBy?: string // wallet address of user who added this route
  contributedByName?: string // display name of user who added this route
  isUserContributed?: boolean
  verified: boolean
  createdAt: number
}

export interface Trail {
  id: string
  name: string
  location: string
  difficulty: 'Easy' | 'Moderate' | 'Hard' // Overall difficulty (can be overridden by individual routes)
  distance: string // Primary/average distance
  duration: string // Primary/average duration
  description: string
  price: number
  available: boolean
  image?: string
  coordinates?: {
    lat: number
    lng: number
  }
  // Multiple route support
  routes: TrailRoute[] // Array of different routes for this trail
  defaultRouteId?: string // ID of the default/recommended route
  // Legacy support (for backward compatibility)
  gpsRoute?: TrailCoordinate[]
  startPoint?: TrailCoordinate
  endPoint?: TrailCoordinate
  features: string[]
  maxCapacity: number
  currentBookings: number
  // Trail ownership and contribution
  contributedBy?: string // wallet address of user who uploaded trail
  contributedByName?: string // display name of user who uploaded trail
  isPremiumOnly?: boolean
  isUserContributed?: boolean
}

// Booking Types
export interface Booking {
  id: string
  trailId: string
  userId: string
  walletAddress: string
  date: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  participants: number
  totalPrice: number
  transactionHash?: string
  createdAt: string
  updatedAt: string
}

// NFT Types
export interface TrailNFT {
  id: string
  trailId: string
  walletAddress: string
  tokenName: string
  metadata: {
    name: string
    description: string
    image: string
    attributes: {
      trail_name: string
      location: string
      difficulty: string
      completion_date: string
      coordinates: string
    }
  }
  mintedAt: string
  transactionHash: string
}

// Token Types
export interface TrekToken {
  symbol: 'TREK'
  decimals: 6
  totalSupply: number
  circulatingSupply: number
}

export interface TokenBalance {
  walletAddress: string
  balance: number
  lastUpdated: string
}

export interface TokenTransaction {
  id: string
  walletAddress: string
  type: 'earned' | 'spent' | 'transferred'
  amount: number
  reason: string
  transactionHash: string
  createdAt: string
}

// User Types
export interface User {
  id: string
  walletAddress: string
  username?: string
  email?: string
  profileImage?: string
  totalTrailsCompleted: number
  totalTrekTokens: number
  nftsOwned: TrailNFT[]
  joinedAt: string
  lastActive: string
}

// Wallet Types
export interface WalletInfo {
  name: string
  address: string
  balance: string
  connected: boolean
  networkId: number
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Smart Contract Types
export interface SmartContractConfig {
  nftPolicyId: string
  tokenPolicyId: string
  scriptAddress: string
  networkId: number
}

// Blockchain Types
export interface BlockchainTransaction {
  hash: string
  blockHeight: number
  timestamp: string
  inputs: any[]
  outputs: any[]
  fees: string
  status: 'pending' | 'confirmed' | 'failed'
}

// Filter and Search Types
export interface TrailFilters {
  difficulty?: string[]
  location?: string[]
  priceRange?: {
    min: number
    max: number
  }
  available?: boolean
  sortBy?: 'name' | 'price' | 'difficulty' | 'distance'
  sortOrder?: 'asc' | 'desc'
}

export interface SearchParams {
  query?: string
  filters?: TrailFilters
  page?: number
  limit?: number
}
