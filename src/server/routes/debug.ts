import express, { Request, Response } from 'express'
import { HyperliquidExchange } from '../services/exchange'
import type { ApiResponse } from '../../shared/types'
import type { Market } from 'ccxt'

const router = express.Router()

// GET /api/debug/pairs - Get all trading pairs from Hyperliquid
router.get('/pairs', async (req: Request, res: Response<ApiResponse<Market[]>>) => {
  try {
    const exchange = new HyperliquidExchange()
    const markets = await exchange.getMarkets()

    res.json({ data: markets, error: null })
  } catch (error: any) {
    console.error('Error fetching markets:', error)
    res.status(500).json({ data: null, error: error.message || 'Failed to fetch markets' })
  }
})

export default router
