# PumpCards Deployment Guide

This guide covers deploying PumpCards to Cloudflare Pages and Workers for production.

## 🚀 Quick Deploy

### Prerequisites
- Cloudflare account with Workers/Pages enabled
- Git repository (GitHub/GitLab)
- Node.js 18+ installed locally

### 1. Frontend Deployment (Cloudflare Pages)

#### Option A: Git Integration (Recommended)
1. Push your code to GitHub/GitLab
2. Go to Cloudflare Dashboard → Pages
3. Click "Create a project" → "Connect to Git"
4. Select your repository
5. Configure build settings:
   ```
   Framework: Next.js
   Build command: npm run build
   Build output directory: .next
   ```
6. Add environment variables:
   ```
   NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
   NEXT_PUBLIC_CHAIN=devnet
   NEXT_PUBLIC_TREASURY_PUBKEY=your-treasury-address
   ```
7. Deploy!

#### Option B: Direct Upload
```bash
npm run build
npx wrangler pages publish .next --project-name=pumpcards
```

### 2. Backend Deployment (Cloudflare Workers)

```bash
cd workers/api
npm install

# Copy and configure
cp wrangler.toml.example wrangler.toml
# Edit wrangler.toml with your values

# Deploy
wrangler deploy
```

### 3. Database Setup

```bash
# Create D1 database
wrangler d1 create pumpcards-db

# Apply schema
wrangler d1 execute pumpcards-db --file=./schema.sql

# Update wrangler.toml with database_id
```

## ⚙️ Configuration

### Environment Variables

#### Frontend (Cloudflare Pages)
Set in Pages dashboard under Settings → Environment variables:

**Production:**
```
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_CHAIN=mainnet-beta
NEXT_PUBLIC_TREASURY_PUBKEY=your-mainnet-treasury
```

**Preview/Development:**
```
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_CHAIN=devnet
NEXT_PUBLIC_TREASURY_PUBKEY=your-devnet-treasury
```

#### Backend (Workers)
Set in wrangler.toml vars section:

```toml
[vars]
SOLANA_RPC_URL = "https://rpc.helius.xyz/?api-key=your-key"
HELIUS_API_KEY = "your-helius-key"
PROJECT_TREASURY_PUBKEY = "your-treasury-pubkey"
PRICE_QUOTE_SIGNING_SECRET = "random-secret-string"
```

### Custom Domain (Optional)

1. Go to Pages → Custom domains
2. Add your domain (e.g., pumpcards.io)
3. Update DNS records as instructed
4. Enable "Always Use HTTPS"

## 🔒 Security Setup

### Secrets Management

Use Cloudflare Workers secrets for sensitive data:

```bash
# Set secrets (not in wrangler.toml)
wrangler secret put HELIUS_API_KEY
wrangler secret put PRICE_QUOTE_SIGNING_SECRET
wrangler secret put HELIUS_WEBHOOK_SECRET
```

### API Security

1. **CORS Configuration**: Already configured for your domain
2. **Rate Limiting**: Use Cloudflare's built-in rate limiting
3. **DDoS Protection**: Automatic with Cloudflare

## 📊 Monitoring

### Cloudflare Analytics

- **Pages Analytics**: Traffic, performance, errors
- **Workers Analytics**: Request volume, latency, errors
- **D1 Analytics**: Query performance, storage usage

### Custom Monitoring

Add to your worker for custom metrics:

```typescript
// In your worker
analytics.writeDataPoint({
  blobs: ["mint_request", userId],
  doubles: [priceSol, timestamp],
  indexes: [tier]
})
```

## 🚨 Production Checklist

### Pre-Deploy
- [ ] All environment variables set
- [ ] Treasury wallet secured (hardware wallet recommended)
- [ ] API keys have appropriate rate limits
- [ ] Database schema applied
- [ ] Custom domain configured (if using)

### Post-Deploy
- [ ] Frontend loads correctly
- [ ] Worker health check responds
- [ ] Database connections work
- [ ] Wallet connection functional
- [ ] Demo data loads (if no API keys)
- [ ] Admin panel accessible

### Mainnet-Specific
- [ ] Switch to mainnet RPC endpoints
- [ ] Use mainnet treasury wallet
- [ ] Update collection address
- [ ] Test with small amounts first
- [ ] Monitor for errors/issues

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy PumpCards
on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run build
      - uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: pumpcards
          directory: .next

  deploy-worker:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: workers/api
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npx wrangler deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

## 🐛 Troubleshooting

### Common Deploy Issues

**Build fails on Pages:**
- Check Node.js version (should be 18+)
- Verify build command and output directory
- Check for TypeScript errors

**Worker deploy fails:**
- Verify wrangler.toml configuration
- Check API token permissions
- Ensure database ID is correct

**Database connection issues:**
- Confirm D1 database exists
- Check binding name matches code
- Verify schema is applied

### Debugging

```bash
# View worker logs
wrangler tail

# Check Pages deployment logs
# Available in Cloudflare Dashboard

# Test worker endpoints
curl https://your-worker.workers.dev/health
```

## 📈 Performance Optimization

### Frontend
- Image optimization (Next.js built-in)
- Code splitting (automatic)
- Static asset caching (Cloudflare CDN)

### Backend
- KV caching for frequent queries
- D1 query optimization
- Background job processing

### Monitoring Performance
- Core Web Vitals in Cloudflare Analytics
- Worker execution time metrics
- D1 query performance

## 🔧 Maintenance

### Regular Tasks
1. **Monitor usage and costs**
2. **Update dependencies monthly**
3. **Review and rotate API keys**
4. **Backup database periodically**
5. **Monitor error rates**

### Scaling Considerations
- Cloudflare Pages: Automatic scaling
- Workers: 100,000 requests/day free, then pay-per-use
- D1: 5M reads, 100K writes/day free
- KV: 100,000 operations/day free

---

**🎉 Congratulations!** Your PumpCards deployment should now be live and ready to mint some cards!