import type { Database } from './database.types'

export type Bot = Database['public']['Tables']['bots']['Row']

export interface Signal {
  desired_direction: number
}

export interface ExchangePosition {
  symbol: string
  size: number
  side: 'long' | 'short'
  entryPrice: number
  unrealizedPnl: number
}

export interface BotWithPosition extends Bot {
  position?: ExchangePosition
}