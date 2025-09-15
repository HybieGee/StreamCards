import { create } from 'zustand'

interface Card {
  id: string
  streamer_id: string
  tier: 'bronze' | 'silver' | 'gold' | 'diamond' | 'mythic'
  art_variant: string
  metadata_uri?: string
  mint_price_lamports: number
  supply: number
  created_at: number
  updated_at: number
  current_price_lamports?: number
  streamer_handle?: string
  streamer_avatar?: string
  current_viewers?: number
  gas_24h?: number
  donations_24h?: number
}

interface Streamer {
  id: string
  handle: string
  token_ca?: string
  avatar_url?: string
  viewers: number
  gas24h: number
  donations24h: number
  tier: string
}

interface CardsState {
  cards: Card[]
  streamers: Streamer[]
  loading: boolean
  error: string | null

  fetchCards: () => Promise<void>
  fetchStreamers: () => Promise<void>
  getCard: (id: string) => Card | undefined
  getStreamer: (id: string) => Streamer | undefined
  updateCardPrice: (cardId: string, price: number) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useCardsStore = create<CardsState>((set, get) => ({
  cards: [],
  streamers: [],
  loading: false,
  error: null,

  fetchCards: async () => {
    try {
      set({ loading: true, error: null })

      const response = await fetch('/api/cards')
      if (!response.ok) {
        throw new Error('Failed to fetch cards')
      }

      const data = await response.json()
      set({ cards: data.cards || [] })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      set({ error: errorMessage })
    } finally {
      set({ loading: false })
    }
  },

  fetchStreamers: async () => {
    try {
      set({ loading: true, error: null })

      const response = await fetch('/api/streamers')
      if (!response.ok) {
        throw new Error('Failed to fetch streamers')
      }

      const data = await response.json()
      set({ streamers: data.streamers || [] })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      set({ error: errorMessage })
    } finally {
      set({ loading: false })
    }
  },

  getCard: (id: string) => {
    return get().cards.find(card => card.id === id)
  },

  getStreamer: (id: string) => {
    return get().streamers.find(streamer => streamer.id === id || streamer.handle === id)
  },

  updateCardPrice: (cardId: string, price: number) => {
    set(state => ({
      cards: state.cards.map(card =>
        card.id === cardId
          ? { ...card, current_price_lamports: price }
          : card
      )
    }))
  },

  setLoading: (loading: boolean) => {
    set({ loading })
  },

  setError: (error: string | null) => {
    set({ error })
  }
}))