import express from 'express'
import botsGet from './bots.get.js'
import botsPost from './bots.post.js'
import botsIdGet from './bots.id.get.js'
import botsIdPost from './bots.id.post.js'
import botsIdDelete from './bots.id.delete.js'
import botsIdAccountGet from './bots.id.account.get.js'
import botsIdPairsGet from './bots.id.pairs.get.js'
import botsIdMarketDataGet from './bots.id.market-data.get.js'
import botsIdLogsGet from './bots.id.logs.get.js'

const router = express.Router()

// GET /api/bots - Get all bots
router.get('/', botsGet)

// POST /api/bots - Create a new bot
router.post('/', botsPost)

// GET /api/bots/:id/account - Get account balance, positions, and open orders
router.get('/:id/account', botsIdAccountGet)

// GET /api/bots/:id/pairs - Get all trading pairs from Hyperliquid
router.get('/:id/pairs', botsIdPairsGet)

// GET /api/bots/:id/market-data - Get market data for the bot's trading pair
router.get('/:id/market-data', botsIdMarketDataGet)

// GET /api/bots/:id/logs - Get bot logs
router.get('/:id/logs', botsIdLogsGet)

// GET /api/bots/:id - Get a specific bot
router.get('/:id', botsIdGet)

// POST /api/bots/:id - Update a bot
router.post('/:id', botsIdPost)

// DELETE /api/bots/:id - Delete a bot
router.delete('/:id', botsIdDelete)

export default router
