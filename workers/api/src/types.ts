export interface Streamer {
  id: string
  handle: string
  token_ca?: string
  avatar_url?: string
  is_approved: number
  created_at: number
  updated_at: number
}

export interface StreamerStats {
  id: number
  streamer_id: string
  ts: number
  viewers: number
  buys: number
  gas_sol: number
  donations_sol: number
  volume_sol: number
  holders: number
}

export interface Card {
  id: string
  streamer_id: string
  tier: 'bronze' | 'silver' | 'gold' | 'diamond' | 'mythic'
  art_variant: string
  metadata_uri?: string
  mint_price_lamports: number
  supply: number
  created_at: number
  updated_at: number
}

export interface Mint {
  id: string
  card_id: string
  nft_mint: string
  owner_pubkey: string
  tx_sig?: string
  edition?: number
  created_at: number
}

export interface Order {
  id: string
  nft_mint: string
  seller_pubkey: string
  price_lamports: number
  status: 'active' | 'filled' | 'cancelled'
  created_at: number
  updated_at: number
}

export interface Fill {
  id: string
  order_id: string
  buyer_pubkey: string
  price_lamports: number
  tx_sig?: string
  created_at: number
}

export interface Threshold {
  id: number
  tier: string
  min_viewers: number
  min_gas_24h: number
  min_donations_24h: number
  created_at: number
  updated_at: number
}

export interface PriceQuote {
  id: string
  card_id: string
  price_lamports: number
  signature: string
  expires_at: number
  created_at: number
}

export interface Setting {
  key: string
  value: string
  created_at: number
  updated_at: number
}

export interface WebhookData {
  type: string
  source: string
  data: any
  timestamp: number
}

export interface QueueMessage {
  type: 'WEBHOOK_DATA' | 'STREAMER_DISCOVERY' | 'TIER_UPGRADE' | 'PRICE_UPDATE'
  data: any
  timestamp: number
}