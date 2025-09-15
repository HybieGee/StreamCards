# PumpCards

Dynamic NFT trading cards for Pump.fun streamers with real-time pricing and automatic tier upgrades.

## 🎯 Overview

PumpCards transforms Pump.fun streaming into a collectible trading card game. Each streamer gets a dynamic NFT card that evolves based on their performance metrics like viewer count, gas usage, and donations. Cards automatically upgrade tiers and adjust pricing in real-time.

## ✨ Key Features

- **🔍 Auto Discovery**: Streamers automatically discovered via Helius API and community sources
- **💰 Dynamic Pricing**: Real-time price adjustments based on performance metrics with surge pricing
- **⚡ Tier System**: Cards upgrade from Bronze → Silver → Gold → Diamond → Mythic based on milestones
- **🛒 Marketplace**: Full secondary market with listing and trading functionality
- **👛 Solana Integration**: Native Solana wallet support with Metaplex NFTs
- **🎨 Beautiful UI**: Dark neon design with tier-specific card animations
- **⚙️ Admin Panel**: Complete management dashboard for streamers, pricing, and tiers

## 🏗 Architecture

### Frontend (Next.js 14)
- **Framework**: Next.js 14 with App Router
- **Styling**: TailwindCSS with custom PumpCards theme
- **State**: Zustand for client state management
- **Wallet**: Solana Wallet Adapter with multiple wallet support
- **UI Components**: Custom components with shadcn/ui patterns

### Backend (Cloudflare Workers)
- **API**: Hono framework with TypeScript
- **Database**: Cloudflare D1 (SQLite) for relational data
- **Cache**: Cloudflare KV for surge pricing and quotas
- **Jobs**: Cloudflare Queues for background processing
- **Cron**: Scheduled tasks for discovery and upgrades

### Blockchain (Solana)
- **Network**: Solana (Devnet for testing, Mainnet for production)
- **NFTs**: Metaplex Umi with mutable metadata
- **RPC**: Helius (preferred) or Triton/QuickNode
- **Payments**: Native SOL transfers to treasury

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Cloudflare account with Workers/Pages enabled
- Solana wallet (Phantom, Solflare, etc.)
- Helius API key (optional, falls back to demo data)

### 1. Clone and Install

```bash
git clone https://github.com/HybieGee/PumpCards.git
cd PumpCards
npm install
```

### 2. Environment Setup

Create `.env.local` in the root directory:

```env
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_CHAIN=devnet
NEXT_PUBLIC_TREASURY_PUBKEY=your-treasury-pubkey
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### 4. Worker Setup (Optional)

For full functionality, set up the Cloudflare Worker:

```bash
cd workers/api
npm install
cp wrangler.toml.example wrangler.toml
# Edit wrangler.toml with your configuration
wrangler dev
```

## 📊 Database Schema

The application uses Cloudflare D1 with the following main tables:

- **streamers**: Streamer profiles and metadata
- **streamer_stats**: Time-series performance data
- **cards**: NFT card definitions and tiers
- **mints**: Individual NFT instances owned by users
- **orders**: Marketplace buy/sell orders
- **thresholds**: Tier upgrade requirements
- **settings**: System configuration

See `workers/api/schema.sql` for the complete schema.

## 🎮 How It Works

### 1. Streamer Discovery
- Cron job runs every 2 minutes
- Fetches data from Helius API and community sources
- New streamers auto-approved or require admin approval
- Demo provider generates synthetic data for testing

### 2. Dynamic Pricing
- Base prices set per tier (Bronze: 0.01 SOL → Mythic: 0.40 SOL)
- Performance multiplier based on viewers, gas usage, donations
- Surge pricing activates during mint bursts (1.75x max)
- Price quotes signed by server, valid for 60 seconds

### 3. Tier Upgrades
- Cron job checks every 10 minutes
- Streamers upgrade when meeting ALL tier requirements
- Cards automatically get new metadata and pricing
- Upgrade history tracked and displayed

### 4. NFT Minting
- Users connect Solana wallet
- Get signed price quote from API
- Pay SOL to treasury, receive NFT
- Metaplex handles metadata and collections

## 🛠 Configuration

### Pricing Configuration

Adjust pricing parameters in the admin panel:

- **Base Prices**: Starting price for each tier
- **Price Caps**: Minimum/maximum SOL prices
- **Metric Weights**: How much each metric affects price
- **Surge Settings**: Threshold and multiplier for surge pricing

### Tier Thresholds

Configure upgrade requirements:

- **Viewers**: Minimum average viewers (24h)
- **Gas**: Minimum SOL spent on gas (24h)
- **Donations**: Minimum SOL donated (24h)

## 🎨 Design System

### Color Palette
- **Pump Green**: `#00FF87` - Primary brand color
- **Electric Blue**: `#00D1FF` - Secondary highlights
- **Neon Pink**: `#FF2FB9` - Accent color
- **Deep Black**: `#0C0C0C` - Background base

### Tier Styling
- **Bronze**: Matte black with green trim
- **Silver**: Metallic sheen with glow
- **Gold**: Foil background with shimmer animation
- **Diamond**: Neon hologram with pulse effect
- **Mythic**: Animated gradient with floating effect

## 🚀 Deployment

### Frontend (Cloudflare Pages)

```bash
npm run build
# Deploy dist/ to Cloudflare Pages
```

### Backend (Cloudflare Workers)

```bash
cd workers/api
wrangler deploy
```

### Database Setup

```bash
# Create D1 database
wrangler d1 create pumpcards-db

# Apply schema
wrangler d1 execute pumpcards-db --file=./schema.sql
```

## 🔧 Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_CHAIN=devnet
NEXT_PUBLIC_TREASURY_PUBKEY=your-treasury-pubkey
```

### Worker (wrangler.toml)
```toml
[vars]
SOLANA_RPC_URL = "https://api.devnet.solana.com"
HELIUS_API_KEY = ""
HELIUS_WEBHOOK_SECRET = ""
PRICE_QUOTE_SIGNING_SECRET = ""
PROJECT_TREASURY_PUBKEY = ""
MINT_COLLECTION_ADDRESS = ""
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Solana Labs for the excellent web3.js libraries
- Metaplex for NFT standards and tooling
- Cloudflare for the edge computing platform
- The Pump.fun community for inspiration

---

**⚠️ Disclaimer**: This is experimental software. Use at your own risk, especially on mainnet.