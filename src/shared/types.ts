export interface Bot {
  id: string
  name: string
  pair: string
  desired_direction: number
  created_at: string
  updated_at: string
}

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

export interface AccountBalance {
  usdcBalance: number
  balance: number
}

export interface ApiResponse<T> {
  data: T | null
  error: string | null
}
