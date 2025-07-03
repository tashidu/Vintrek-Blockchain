# VinTrek - Blockchain-Powered Eco-Tourism Platform

VinTrek is a revolutionary blockchain-powered web platform that gamifies eco-tourism in Sri Lanka. Users can discover hiking trails, book adventures, mint NFTs upon completion, and earn TREK tokens for their outdoor activities.

## 🌟 Features

### Core Features
- **Trail Discovery**: Browse and filter hiking trails across Sri Lanka
- **Blockchain Booking**: Secure, transparent booking system using Cardano
- **NFT Minting**: Mint unique trail completion certificates as NFTs
- **Token Rewards**: Earn TREK tokens for completing trails and activities
- **Wallet Integration**: Connect with Cardano wallets (Lace, Eternl, Nami, Flint)

### Blockchain Features
- **On-chain Booking Logs**: Transparent booking confirmations
- **Trail NFTs**: Unique collectible certificates with metadata
- **TREK Token Economy**: Utility token for rewards and premium features
- **Smart Contracts**: Automated minting and reward distribution

## 🛠 Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Blockchain**: Cardano, Mesh SDK, Blockfrost API
- **Smart Contracts**: Aiken/Plutus
- **Wallets**: Lace, Eternl, Nami, Flint
- **Storage**: IPFS/Arweave for NFT metadata

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- A Cardano wallet (Lace or Eternl recommended)
- Blockfrost API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/vintrek.git
   cd vintrek
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   - Blockfrost project ID
   - Smart contract addresses
   - API keys

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Blockfrost Setup
1. Create account at [Blockfrost.io](https://blockfrost.io)
2. Create a new project for Cardano testnet
3. Copy your project ID to `NEXT_PUBLIC_BLOCKFROST_PROJECT_ID`

### Wallet Setup
1. Install a Cardano wallet:
   - [Lace Wallet](https://www.lace.io/)
   - [Eternl Wallet](https://eternl.io/)
2. Switch to testnet mode
3. Get test ADA from [Cardano Testnet Faucet](https://testnets.cardano.org/en/testnets/cardano/tools/faucet/)

## 📱 Usage

### For Hikers
1. **Connect Wallet**: Click "Connect Wallet" and select your Cardano wallet
2. **Browse Trails**: Explore available hiking trails with filters
3. **Book Adventure**: Select a trail and book with your wallet
4. **Complete Trail**: Hike the trail and verify completion
5. **Mint NFT**: Receive a unique trail completion NFT
6. **Earn Tokens**: Get TREK tokens for activities

### For Developers
1. **Smart Contracts**: Located in `/contracts` directory
2. **API Routes**: Backend logic in `/src/app/api`
3. **Components**: Reusable UI components in `/src/components`
4. **Types**: TypeScript definitions in `/src/types`

## 🏗 Project Structure

```
vintrek/
├── src/
│   ├── app/                 # Next.js app directory
│   ├── components/          # React components
│   │   ├── providers/       # Context providers
│   │   ├── wallet/          # Wallet integration
│   │   ├── trails/          # Trail-related components
│   │   └── ui/              # UI components
│   ├── lib/                 # Utility functions
│   ├── types/               # TypeScript definitions
│   └── hooks/               # Custom React hooks
├── contracts/               # Smart contracts (Aiken)
├── public/                  # Static assets
└── docs/                    # Documentation
```

## 🔗 Blockchain Integration

### Smart Contracts
- **NFT Minting Contract**: Mints trail completion certificates
- **Token Contract**: Manages TREK token distribution
- **Booking Contract**: Handles on-chain booking logs

### Wallet Integration
- **Mesh SDK**: Core blockchain interactions
- **Multi-wallet Support**: Lace, Eternl, Nami, Flint
- **Transaction Signing**: Secure transaction handling

## 🎯 Roadmap

### Phase 1 (Current)
- [x] Basic trail discovery and booking
- [x] Wallet integration
- [x] NFT minting functionality
- [x] Token reward system

### Phase 2 (Next)
- [ ] AI trail recommendations
- [ ] AR/VR content unlocks
- [ ] Social features and leaderboards
- [ ] Mobile app (Flutter)

### Phase 3 (Future)
- [ ] Multi-language support
- [ ] National park integrations
- [ ] Advanced analytics
- [ ] Marketplace for NFTs

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.vintrek.com](https://docs.vintrek.com)
- **Discord**: [Join our community](https://discord.gg/vintrek)
- **Email**: support@vintrek.com
- **Issues**: [GitHub Issues](https://github.com/your-username/vintrek/issues)

## 🙏 Acknowledgments

- Cardano Foundation for blockchain infrastructure
- Mesh SDK team for excellent developer tools
- Sri Lankan hiking community for inspiration
- Open source contributors

---

**Built with ❤️ for the eco-tourism community in Sri Lanka**
# Vintrek-Blockchain
