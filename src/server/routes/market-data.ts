import express, { Request, Response } from 'express'
import { HyperliquidExchange } from '../services/exchange.js'
import type { ApiResponse } from '../../shared/types.js'
import type { Market } from 'ccxt'

const router = express.Router()

// GET /api/market-data/:symbol - Get market data for a specific symbol
router.get('/:symbol', async (req: Request, res: Response<ApiResponse<Market | null>>) => {
  try {
    const { symbol } = req.params
    
    const exchange = new HyperliquidExchange()
    const market = await exchange.getMarket(symbol)
    
    res.json({ data: market, error: null })
  } catch (error: any) {
    console.error('Error fetching market data:', error)
    res.status(500).json({ data: null, error: error.message || 'Failed to fetch market data' })
  }
})

export default router
