export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

export function getApiUrl(path: string): string {
  if (path.startsWith('/api/')) {
    path = path.substring(4) // Remove /api prefix
  }
  return `${API_BASE_URL}/api${path.startsWith('/') ? '' : '/'}${path}`
}

export const SOLANA_CONFIG = {
  rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  chain: process.env.NEXT_PUBLIC_CHAIN || 'devnet',
  treasuryPubkey: process.env.NEXT_PUBLIC_TREASURY_PUBKEY || '',
}