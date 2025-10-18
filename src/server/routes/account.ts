import express, { Request, Response } from 'express'
import { HyperliquidExchange } from '../services/exchange.js'

const router = express.Router()

// GET /api/account - Get account balance
router.get('/', async (req: Request, res: Response) => {
  try {
    const exchange = new HyperliquidExchange()
    const balance = await exchange.getUSDCBalance()
    
    res.json({
      data: { 
        usdcBalance: balance,
        balance 
      },
      error: null
    })
  } catch (error) {
    console.error('Error fetching account balance:', error)
    res.status(500).json({
      data: null,
      error: 'Failed to fetch account balance'
    })
  }
})

export default router
