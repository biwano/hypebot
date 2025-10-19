import type { Database } from './database.types'
import type { Balances, Order, Position } from 'ccxt'

// Raw database type with nullable fields
export type Bot = Database['public']['Tables']['bots']['Row']

export interface Signal {
  desired_direction: number
}

export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export interface AccountData {
  balance: Balances
  positions: Position[]
  orders: Order[]
}

