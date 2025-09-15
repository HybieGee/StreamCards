-- PumpCards Database Schema

-- Streamers table
CREATE TABLE IF NOT EXISTS streamers (
  id TEXT PRIMARY KEY,
  handle TEXT UNIQUE NOT NULL,
  token_ca TEXT,
  avatar_url TEXT,
  is_approved INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Streamer statistics (rolling data)
CREATE TABLE IF NOT EXISTS streamer_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  streamer_id TEXT NOT NULL,
  ts INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  viewers INTEGER DEFAULT 0,
  buys INTEGER DEFAULT 0,
  gas_sol REAL DEFAULT 0,
  donations_sol REAL DEFAULT 0,
  volume_sol REAL DEFAULT 0,
  holders INTEGER DEFAULT 0,
  FOREIGN KEY(streamer_id) REFERENCES streamers(id)
);

-- Trading cards
CREATE TABLE IF NOT EXISTS cards (
  id TEXT PRIMARY KEY,
  streamer_id TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'bronze',
  art_variant TEXT DEFAULT 'base',
  metadata_uri TEXT,
  mint_price_lamports INTEGER NOT NULL,
  supply INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY(streamer_id) REFERENCES streamers(id)
);

-- NFT mints
CREATE TABLE IF NOT EXISTS mints (
  id TEXT PRIMARY KEY,
  card_id TEXT NOT NULL,
  nft_mint TEXT UNIQUE NOT NULL,
  owner_pubkey TEXT NOT NULL,
  tx_sig TEXT,
  edition INTEGER,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY(card_id) REFERENCES cards(id)
);

-- Tier thresholds configuration
CREATE TABLE IF NOT EXISTS thresholds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tier TEXT UNIQUE NOT NULL,
  min_viewers INTEGER DEFAULT 0,
  min_gas_24h REAL DEFAULT 0,
  min_donations_24h REAL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Marketplace orders
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  nft_mint TEXT NOT NULL,
  seller_pubkey TEXT NOT NULL,
  price_lamports INTEGER NOT NULL,
  status TEXT DEFAULT 'active',
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Marketplace fills
CREATE TABLE IF NOT EXISTS fills (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  buyer_pubkey TEXT NOT NULL,
  price_lamports INTEGER NOT NULL,
  tx_sig TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY(order_id) REFERENCES orders(id)
);

-- System settings
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Price quotes (signed quotes with expiry)
CREATE TABLE IF NOT EXISTS price_quotes (
  id TEXT PRIMARY KEY,
  card_id TEXT NOT NULL,
  price_lamports INTEGER NOT NULL,
  signature TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY(card_id) REFERENCES cards(id)
);

-- Mint activity (for surge pricing)
CREATE TABLE IF NOT EXISTS mint_activity (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  card_id TEXT NOT NULL,
  minted_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY(card_id) REFERENCES cards(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_streamer_stats_streamer_ts ON streamer_stats(streamer_id, ts);
CREATE INDEX IF NOT EXISTS idx_cards_streamer ON cards(streamer_id);
CREATE INDEX IF NOT EXISTS idx_mints_card ON mints(card_id);
CREATE INDEX IF NOT EXISTS idx_mints_owner ON mints(owner_pubkey);
CREATE INDEX IF NOT EXISTS idx_orders_seller ON orders(seller_pubkey);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_fills_order ON fills(order_id);
CREATE INDEX IF NOT EXISTS idx_price_quotes_card ON price_quotes(card_id);
CREATE INDEX IF NOT EXISTS idx_price_quotes_expires ON price_quotes(expires_at);
CREATE INDEX IF NOT EXISTS idx_mint_activity_card_time ON mint_activity(card_id, minted_at);

-- Insert default tier thresholds
INSERT OR REPLACE INTO thresholds (tier, min_viewers, min_gas_24h, min_donations_24h) VALUES
('bronze', 0, 0, 0),
('silver', 500, 20, 1),
('gold', 1500, 75, 5),
('diamond', 3000, 150, 15),
('mythic', 5000, 300, 50);

-- Insert default system settings
INSERT OR REPLACE INTO settings (key, value) VALUES
('pricing_config', '{"basePricesSOL":{"Bronze":0.01,"Silver":0.025,"Gold":0.06,"Diamond":0.15,"Mythic":0.40},"capsSOL":{"min":0.005,"max":1.50},"weights":{"viewers":0.35,"gas24h":0.45,"donations24h":0.10,"demand":0.10},"normalizers":{"viewers":{"p50":300,"p90":3000},"gas24h":{"p50":10,"p90":150},"donations24h":{"p50":2,"p90":25}},"surge":{"windowMin":15,"thresholdMints":25,"maxMultiplier":1.75,"cooldownMin":10}}'),
('marketplace_fee_bps', '250'),
('treasury_pubkey', ''),
('collection_address', '');

-- Triggers for updated_at timestamps
CREATE TRIGGER IF NOT EXISTS update_streamers_timestamp
AFTER UPDATE ON streamers
BEGIN
  UPDATE streamers SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_cards_timestamp
AFTER UPDATE ON cards
BEGIN
  UPDATE cards SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_orders_timestamp
AFTER UPDATE ON orders
BEGIN
  UPDATE orders SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_settings_timestamp
AFTER UPDATE ON settings
BEGIN
  UPDATE settings SET updated_at = strftime('%s', 'now') WHERE key = NEW.key;
END;