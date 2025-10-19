import express, { Request, Response } from 'express'
import { HyperliquidExchange } from '../services/exchange.js'
import type { ApiResponse } from '../../shared/types.js'
import type { Balances, Position } from 'ccxt'

const router = express.Router()

// GET /api/account - Get account balance and positions
router.get('/', async (req: Request, res: Response<ApiResponse<{ balance: Balances; positions: Position[] }>>) => {
  try {
    const exchange = new HyperliquidExchange()
    const [balance, positions] = await Promise.all([
      exchange.getBalance(),
      exchange.getPositions()
    ])

    res.json({ data: { balance, positions }, error: null })
  } catch (error: any) {
    console.error('Error fetching account data:', error)
    res.status(500).json({ data: null, error: error.message || 'Failed to fetch account data' })
  }
})

export default router
