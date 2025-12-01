import { Request, Response } from 'express'
import { getSupabaseClient } from '../services/supabase'
import { HyperliquidExchange } from '../services/exchange'
import type { ApiResponse } from '../../shared/types/index.js'
import type { Market } from 'ccxt'

// GET /api/bots/:id/pairs - Get all trading pairs from Hyperliquid
export default async (req: Request, res: Response<ApiResponse<Market[]>>) => {
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
    const markets = await exchange.getMarkets()

    res.json({ data: markets, error: null })
  } catch (error: any) {
    console.error('Error fetching markets:', error)
    res.status(500).json({ data: null, error: error.message || 'Failed to fetch markets' })
  }
}

