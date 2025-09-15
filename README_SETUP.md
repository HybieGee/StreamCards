# PumpCards Setup Guide

Complete setup instructions for deploying PumpCards to production.

## 🔑 Required API Keys and Services

### Mandatory Services

1. **Cloudflare Account**
   - Workers: API backend hosting
   - Pages: Frontend hosting
   - D1: Database storage
   - KV: Caching layer
   - Sign up at: https://dash.cloudflare.com

2. **Solana RPC Provider** (Choose one)
   - **Helius** (Recommended): https://helius.xyz
   - **Triton**: https://triton.one
   - **QuickNode**: https://quicknode.com
   - **Free**: Use public endpoints (rate limited)

### Optional Services

3. **Helius Webhooks** (Enhanced Discovery)
   - Real-time transaction monitoring
   - On-chain event processing
   - Get API key at: https://helius.xyz

4. **Community APIs** (Additional Discovery)
   - Custom Pump.fun data providers
   - Streamer directory APIs
   - Ask community for endpoints

## ⚙️ Step-by-Step Setup

### 1. Cloudflare Resources

Create these resources in your Cloudflare dashboard:

```bash
# D1 Database
wrangler d1 create pumpcards-db
# Note the database_id for wrangler.toml

# KV Namespace
wrangler kv:namespace create "PUMPCARDS_KV"
# Note the id for wrangler.toml

# R2 Bucket (Optional - for media storage)
wrangler r2 bucket create pumpcards-media
```

### 2. Solana Setup

#### Generate Treasury Wallet
```bash
# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/v1.16.0/install)"

# Generate new keypair
solana-keygen new --outfile ~/.config/solana/treasury.json

# Get public key
solana-keygen pubkey ~/.config/solana/treasury.json
```

#### Create NFT Collection (Optional)
```bash
# Use Metaplex CLI or Sugar to create collection
# Or use existing collection address
```

### 3. Environment Configuration

#### Frontend (.env.local)
```env
# Solana Configuration
NEXT_PUBLIC_SOLANA_RPC_URL=https://rpc.helius.xyz/?api-key=YOUR_HELIUS_KEY
NEXT_PUBLIC_CHAIN=devnet
NEXT_PUBLIC_TREASURY_PUBKEY=YOUR_TREASURY_PUBKEY

# Optional: Collection address for NFTs
NEXT_PUBLIC_COLLECTION_ADDRESS=YOUR_COLLECTION_ADDRESS
```

#### Worker (wrangler.toml)
```toml
name = "pumpcards-api"
main = "src/index.ts"
compatibility_date = "2024-01-15"

[[d1_databases]]
binding = "DB"
database_name = "pumpcards-db"
database_id = "YOUR_DATABASE_ID"

[[kv_namespaces]]
binding = "CACHE"
id = "YOUR_KV_NAMESPACE_ID"

[vars]
SOLANA_RPC_URL = "https://rpc.helius.xyz/?api-key=YOUR_HELIUS_KEY"
HELIUS_API_KEY = "YOUR_HELIUS_KEY"
HELIUS_WEBHOOK_SECRET = "your-webhook-secret"
PRICE_QUOTE_SIGNING_SECRET = "your-signing-secret"
PROJECT_TREASURY_PUBKEY = "YOUR_TREASURY_PUBKEY"
MINT_COLLECTION_ADDRESS = "YOUR_COLLECTION_ADDRESS"
```

### 4. Database Initialization

```bash
cd workers/api

# Apply schema
wrangler d1 execute pumpcards-db --file=./schema.sql

# Verify tables created
wrangler d1 execute pumpcards-db --command="SELECT name FROM sqlite_master WHERE type='table';"
```

### 5. Deploy Backend

```bash
cd workers/api
npm install
wrangler deploy
```

### 6. Configure Webhooks (Optional)

If using Helius webhooks:

```bash
# Create webhook in Helius dashboard
# Point to: https://your-worker.your-subdomain.workers.dev/api/ingest
# Set secret in environment variables
```

### 7. Deploy Frontend

```bash
# Build
npm run build

# Deploy to Cloudflare Pages
# Connect Git repository or upload dist/ manually
```

## 🔧 Configuration Options

### Pricing Configuration

Default values in database settings table:

```json
{
  "basePricesSOL": {
    "Bronze": 0.01,
    "Silver": 0.025,
    "Gold": 0.06,
    "Diamond": 0.15,
    "Mythic": 0.40
  },
  "capsSOL": { "min": 0.005, "max": 1.50 },
  "weights": {
    "viewers": 0.35,
    "gas24h": 0.45,
    "donations24h": 0.10,
    "demand": 0.10
  }
}
```

### Tier Thresholds

Default upgrade requirements:

| Tier | Min Viewers | Min Gas (24h SOL) | Min Donations (24h SOL) |
|------|-------------|-------------------|-------------------------|
| Bronze | 0 | 0 | 0 |
| Silver | 500 | 20 | 1 |
| Gold | 1500 | 75 | 5 |
| Diamond | 3000 | 150 | 15 |
| Mythic | 5000 | 300 | 50 |

## 🧪 Testing Setup

### Development Mode

```bash
# Run frontend
npm run dev

# Run worker locally
cd workers/api
wrangler dev
```

### Demo Data

Without API keys, the system falls back to demo data:
- 8 synthetic streamers with randomized metrics
- Simulated performance fluctuations
- Full functionality for testing UI/UX

### Testing Checklist

- [ ] Wallet connection works
- [ ] Demo streamers load on homepage
- [ ] Price quotes generate successfully
- [ ] Minting flow completes (testnet)
- [ ] Admin panel accessible
- [ ] Tier upgrades trigger manually
- [ ] Marketplace displays orders

## 🚨 Security Considerations

### Secrets Management

1. **Never commit secrets to git**
2. **Use Cloudflare Workers secrets for sensitive data**
3. **Rotate API keys regularly**
4. **Use different keys for dev/staging/prod**

### Smart Contract Security

1. **Use established Metaplex programs**
2. **Validate all transaction inputs**
3. **Implement proper access controls**
4. **Test thoroughly on devnet**

### API Security

1. **Rate limiting via Cloudflare**
2. **Webhook signature verification**
3. **Input validation and sanitization**
4. **CORS configuration**

## 📊 Monitoring and Analytics

### Cloudflare Analytics

- Worker request metrics
- Error rates and latency
- Database query performance
- KV operation metrics

### Custom Metrics

Track in admin panel:
- Daily active users
- Mint volume and revenue
- Popular streamers/tiers
- System health metrics

## 🔄 Maintenance

### Regular Tasks

1. **Monitor API quotas** (Helius, RPC providers)
2. **Review streamer approvals** (Admin panel)
3. **Adjust pricing parameters** (Based on usage)
4. **Update tier thresholds** (As ecosystem grows)

### Backup Strategy

1. **D1 database exports** (Manual via dashboard)
2. **Configuration backups** (Export settings)
3. **Code versioning** (Git tags for releases)

## 🆘 Troubleshooting

### Common Issues

**Wallet won't connect**
- Check RPC endpoint is accessible
- Verify network configuration (devnet vs mainnet)
- Clear browser cache/cookies

**Minting fails**
- Ensure sufficient SOL balance
- Check treasury address is valid
- Verify quote hasn't expired

**Demo data not loading**
- Check worker deployment status
- Verify D1 database connection
- Review worker logs in dashboard

**Admin panel empty**
- Confirm wallet has admin access
- Check worker API endpoints
- Verify D1 database has data

### Getting Help

1. Check worker logs in Cloudflare dashboard
2. Review browser console for frontend errors
3. Test API endpoints directly
4. Join Solana/Metaplex Discord for support

## 📞 Support

For setup assistance:
- Create GitHub issue: https://github.com/HybieGee/PumpCards/issues
- Documentation: Check README.md and code comments
- Community: Solana Discord, Pump.fun community

---

**Ready to pump? 🚀** Follow this guide step by step and you'll have PumpCards running in production!