import express, { Request, Response } from 'express'
import { HyperliquidExchange } from '../services/exchange.js'
import type { ApiResponse } from '../../shared/types.js'

const router = express.Router()

// GET /api/account - Get account balance
router.get('/', async (req: Request, res: Response<ApiResponse<{ usdcBalance: number }>>) => {
  try {
    const exchange = new HyperliquidExchange()
    const accountBalance = await exchange.getAccountBalance()

    if (!accountBalance) {
      return res.status(503).json({ data: null, error: 'Exchange not available - API credentials not configured' })
    }

    res.json({ data: accountBalance, error: null })
  } catch (error: any) {
    console.error('Error fetching account balance:', error)
    res.status(500).json({ data: null, error: error.message || 'Failed to fetch account balance' })
  }
})

export default router
