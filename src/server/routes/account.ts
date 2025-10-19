import express, { Request, Response } from 'express'
import { HyperliquidExchange } from '../services/exchange.js'
import type { ApiResponse, AccountData } from '../../shared/types/index.js'

const router = express.Router()

// GET /api/account - Get account balance, positions, and open orders
router.get('/', async (req: Request, res: Response<ApiResponse<AccountData>>) => {
  try {
    const exchange = new HyperliquidExchange()
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
})

export default router
