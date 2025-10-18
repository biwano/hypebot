import express, { Request, Response } from 'express'
import { HyperliquidExchange } from '../services/exchange'
import type { ApiResponse } from '../../shared/types'

const router = express.Router()

// GET /api/debug/pairs - Get all trading pairs from Hyperliquid
router.get('/pairs', async (req: Request, res: Response<ApiResponse<any[]>>) => {
  try {
    const exchange = new HyperliquidExchange()
    const pairs = await exchange.getTradingPairs()

    res.json({ data: pairs, error: null })
  } catch (error: any) {
    console.error('Error fetching trading pairs:', error)
    res.status(500).json({ data: null, error: error.message || 'Failed to fetch trading pairs' })
  }
})

export default router
