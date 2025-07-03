# VinTrek Development Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Cardano wallet (Lace, Eternl, Nami, or Flint)
- Blockfrost API key (for testnet)

### Installation
```bash
# Clone and install dependencies
git clone <your-repo>
cd vintrek
npm install

# Set up environment
cp .env.local.example .env.local
# Edit .env.local with your Blockfrost API key

# Start development server
npm run dev
```

## 🏗 Project Structure

```
vintrek/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── page.tsx           # Home page
│   │   ├── trails/            # Trails listing
│   │   ├── dashboard/         # User dashboard
│   │   └── rewards/           # Rewards system
│   ├── components/            # React components
│   │   ├── providers/         # Context providers
│   │   ├── wallet/           # Wallet integration
│   │   ├── trails/           # Trail components
│   │   └── ui/               # UI components
│   ├── lib/                  # Utility functions
│   │   ├── blockchain.ts     # Blockchain service
│   │   └── utils.ts          # Helper functions
│   └── types/                # TypeScript definitions
├── contracts/                # Aiken smart contracts
└── public/                   # Static assets
```

## 🔗 Blockchain Integration

### Wallet Connection
- Uses Mesh SDK for Cardano wallet integration
- Supports Lace, Eternl, Nami, and Flint wallets
- Automatic reconnection on page reload

### Smart Contracts (Aiken)
- **Trail NFT Minting**: Mint completion certificates
- **TREK Token Rewards**: Distribute utility tokens
- **Booking Validation**: On-chain booking confirmations

### Blockfrost API
- Query wallet balances and assets
- Fetch NFT metadata
- Verify transactions on-chain

## 🎯 Core Features Implementation

### 1. Trail Discovery & Booking
- **Location**: `src/app/trails/page.tsx`
- **Features**: Search, filter, sort trails
- **Booking**: Modal with wallet integration
- **Payment**: ADA transactions via Mesh SDK

### 2. Wallet Integration
- **Provider**: `src/components/providers/WalletProvider.tsx`
- **Component**: `src/components/wallet/WalletConnect.tsx`
- **Service**: `src/lib/blockchain.ts`

### 3. NFT Minting
- **Contract**: `contracts/trail_nft.ak`
- **Service**: `blockchainService.mintTrailNFT()`
- **Metadata**: IPFS/Arweave storage

### 4. Token Rewards
- **Token**: TREK utility token
- **Rewards**: 50-100 tokens per trail completion
- **Usage**: Premium features, discounts

### 5. User Dashboard
- **Location**: `src/app/dashboard/page.tsx`
- **Features**: NFT collection, token balance, activity

## 🛠 Development Workflow

### Adding New Trails
1. Update mock data in `src/app/trails/page.tsx`
2. Add trail images to `public/trails/`
3. Update trail metadata structure if needed

### Implementing Smart Contracts
1. Write Aiken contracts in `contracts/`
2. Compile with Aiken CLI
3. Deploy to Cardano testnet
4. Update contract addresses in `.env.local`

### Testing Blockchain Features
1. Use Cardano testnet
2. Get test ADA from faucet
3. Test wallet connections
4. Verify transactions on CardanoScan

## 🔧 Configuration

### Environment Variables
```bash
# Blockfrost (Required)
NEXT_PUBLIC_BLOCKFROST_PROJECT_ID=your_project_id
NEXT_PUBLIC_BLOCKFROST_API_URL=https://cardano-testnet.blockfrost.io/api/v0

# Smart Contracts (Update after deployment)
NEXT_PUBLIC_NFT_POLICY_ID=your_nft_policy_id
NEXT_PUBLIC_TOKEN_POLICY_ID=your_token_policy_id
NEXT_PUBLIC_SCRIPT_ADDRESS=your_script_address
```

### Blockfrost Setup
1. Create account at [blockfrost.io](https://blockfrost.io)
2. Create testnet project
3. Copy project ID to environment

### Wallet Setup
1. Install Cardano wallet extension
2. Switch to testnet mode
3. Get test ADA from [Cardano Testnet Faucet](https://testnets.cardano.org/en/testnets/cardano/tools/faucet/)

## 🧪 Testing

### Manual Testing Checklist
- [ ] Wallet connection/disconnection
- [ ] Trail browsing and filtering
- [ ] Booking modal functionality
- [ ] Dashboard data loading
- [ ] Rewards page navigation

### Blockchain Testing
- [ ] Wallet balance display
- [ ] Transaction creation
- [ ] NFT metadata fetching
- [ ] Token balance queries

## 🚀 Deployment

### Frontend Deployment
```bash
# Build for production
npm run build

# Deploy to Vercel/Netlify
npm run start
```

### Smart Contract Deployment
```bash
# Install Aiken
curl -sSfL https://install.aiken-lang.org | bash

# Compile contracts
aiken build

# Deploy to testnet (requires cardano-cli)
cardano-cli transaction build-raw ...
```

## 📱 Mobile Development (Future)

### React Native Setup
- Use React Native with Mesh SDK
- Implement native wallet connections
- Add GPS tracking for trail completion

### Flutter Alternative
- Use Flutter with Cardano Dart SDK
- Cross-platform mobile app
- Native performance

## 🔮 Future Enhancements

### Phase 2 Features
- [ ] AI trail recommendations
- [ ] AR/VR content unlocks
- [ ] Real-time GPS tracking
- [ ] Social features and leaderboards

### Phase 3 Features
- [ ] Multi-country expansion
- [ ] DAO governance with TREK tokens
- [ ] Carbon offset integration
- [ ] Enterprise partnerships

## 🐛 Troubleshooting

### Common Issues

**Wallet Connection Fails**
- Check if wallet extension is installed
- Ensure wallet is on testnet
- Clear browser cache and try again

**Transaction Errors**
- Verify sufficient ADA balance
- Check network connectivity
- Ensure correct contract addresses

**NFT/Token Not Showing**
- Wait for blockchain confirmation
- Refresh wallet/dashboard
- Check transaction on CardanoScan

### Debug Mode
```bash
# Enable debug logging
NEXT_PUBLIC_DEBUG=true npm run dev
```

## 📚 Resources

### Documentation
- [Mesh SDK Docs](https://meshjs.dev/)
- [Aiken Language Guide](https://aiken-lang.org/)
- [Cardano Developer Portal](https://developers.cardano.org/)

### Tools
- [Blockfrost API](https://blockfrost.io/)
- [CardanoScan Explorer](https://cardanoscan.io/)
- [Cardano Testnet Faucet](https://testnets.cardano.org/en/testnets/cardano/tools/faucet/)

### Community
- [Cardano Discord](https://discord.gg/cardano)
- [Mesh SDK Discord](https://discord.gg/meshjs)
- [Aiken Discord](https://discord.gg/aiken)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request
5. Update documentation

---

**Happy Coding! 🏔️⛓️**
