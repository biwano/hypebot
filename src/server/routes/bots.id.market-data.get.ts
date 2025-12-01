import { Request, Response } from 'express'
import { getSupabaseClient } from '../services/supabase'
import { HyperliquidExchange } from '../services/exchange'
import type { ApiResponse } from '../../shared/types/index.js'
import type { Market } from 'ccxt'

// GET /api/bots/:id/market-data - Get market data for the bot's trading pair
export default async (req: Request, res: Response<ApiResponse<Market | null>>) => {
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
    const market = await exchange.getMarket()
    
    res.json({ data: market, error: null })
  } catch (error: any) {
    console.error('Error fetching market data:', error)
    res.status(500).json({ data: null, error: error.message || 'Failed to fetch market data' })
  }
}

