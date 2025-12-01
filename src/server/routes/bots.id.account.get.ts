import { Request, Response } from 'express'
import { getSupabaseClient } from '../services/supabase'
import { HyperliquidExchange } from '../services/exchange'
import type { ApiResponse, AccountData } from '../../shared/types/index.js'

// GET /api/bots/:id/account - Get account balance, positions, and open orders
export default async (req: Request, res: Response<ApiResponse<AccountData>>) => {
  try {
    const { id } = req.params

    const supabase = getSupabaseClient()
    const { data: bot, error: botError } = await supabase
      .from('bots')
      .select('*')
      .eq('id', id)
      .single()

    if (botError || !bot) {
      return res.status(404).json({ data: null, error: 'Bot not found' })
    }

    const exchange = new HyperliquidExchange(bot)
    const [balance, positions, orders] = await Promise.all([
      exchange.getBalance(),
      exchange.getPositions(),
      exchange.getOpenOrders()
    ])

    res.json({ data: { balance, positions, orders }, error: null })
  } catch (error: any) {
    console.error('Error fetching account data:', error)
    res.status(500).json({ data: null, error: error.message || 'Failed to fetch account data' })
  }
}

