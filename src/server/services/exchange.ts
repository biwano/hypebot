import ccxt, { Exchange, Position, Market, Balances, Ticker, Num, Order} from 'ccxt'
import { PromiseCaching } from 'promise-caching'
import { CACHE_TIME_SECONDS } from '../../shared/constants'
import log from './log'
import { privateKeyToAccount } from 'viem/accounts'
import type { Bot } from '../../shared/types/index'

export class HyperliquidExchange {
  private _exchange: Exchange | null
  private user: string
  private cache: PromiseCaching
  private bot: Bot

  constructor(bot: Bot) {
    this.bot = bot
    const privateKey = bot.hyperliquid_private_key
    this.user = bot.hyperliquid_user!

    if (!(privateKey && this.user)) {
      throw new Error(`Hyperliquid API credentials not configured for bot ${bot.id}`)
    }

    // Ensure private key has 0x prefix for viem
    const formattedPrivateKey = privateKey.startsWith('0x') 
      ? (privateKey as `0x${string}`)
      : (`0x${privateKey}` as `0x${string}`)

    // Compute wallet address from private key using viem
    const account = privateKeyToAccount(formattedPrivateKey)
    const walletAddress = account.address

    // Use the actual Hyperliquid exchange from CCXT
    this._exchange = new ccxt.hyperliquid({
      privateKey,
      walletAddress,
      options: {
        defaultType: 'future'
      }
    })

    // Initialize cache with 5 minute TTL
    this.cache = new PromiseCaching({ returnExpired: true });

  }

  get exchange(): Exchange {
    if (!this._exchange) {
      throw new Error('Exchange not initialized')
    }
    return this._exchange
  }

  async getMarket(): Promise<Market> {
    return this.cache.get(`market:${this.bot.pair}`, CACHE_TIME_SECONDS, async () => {
      console.debug(`🔍 Getting market for ${this.bot.pair} from exchange`)
      const markets = await this.exchange!.fetchMarkets()
      const market = markets.find(m => m?.symbol === this.bot.pair)
      if (!market) {
        throw new Error(`Market not found for ${this.bot.pair}`)
      }
      return market
    })
  }

  async getTicker(): Promise<Ticker> {
    return this.cache.get(`ticker:${this.bot.pair}`, CACHE_TIME_SECONDS, async () => {
      console.debug(`🔍 Getting ticker for ${this.bot.pair} from exchange`)
      return await this.exchange!.fetchTicker(this.bot.pair)
    })
  }

  public async getPrice(side: 'buy' | 'sell'): Promise<number> {
    const ticker = await this.getTicker()
    const price = side === 'buy' ? ticker.bid : ticker.ask
    if (!price) {
      throw new Error(`Unable to get price for ${this.bot.pair}`)
    }
    return price
  }

  async getOpenOrders(): Promise<Order[]> {
    return this.cache.get<Order[]>(`openOrders:${this.bot.pair}`, CACHE_TIME_SECONDS, async () => {
      console.log(`🔍 Getting open orders for ${this.bot.pair}`)
      const orders = await this.exchange!.fetchOpenOrders(this.bot.pair, undefined, undefined, { user: this.user })
      return orders
    })
  }

  private async calculateLimitPrice(side: 'buy' | 'sell', ticksOffset: number = 5): Promise<number> {
    // Get current ticker price
    const [currentPrice, market] = await Promise.all([this.getPrice(side),  this.getMarket()])
    
    if (!currentPrice) {
      throw new Error(`Unable to get current price for ${this.bot.pair}`)
    }
    
    // Get tick size from market data
    const tickSize = market?.precision?.price || 0.01 // Get tick size from market data, fallback to 0.01
    const priceAdjustment = ticksOffset * tickSize
    
    // Calculate limit price
    // For buy orders, we want to buy below market price
    // For sell orders, we want to sell above market price
    const limitPrice = side === 'buy' 
      ? currentPrice - priceAdjustment
      : currentPrice + priceAdjustment
    
    
    return limitPrice
  }

  private async cancelAllOrders(): Promise<void> {
    const existingOrders = await this.exchange!.fetchOpenOrders(this.bot.pair, undefined, undefined, { user: this.user })
    if (existingOrders.length > 0) {
      console.debug(`🔍 Found ${existingOrders.length} existing orders for ${this.bot.pair}, cancelling all...`)
      
      for (const order of existingOrders) {
        await this.exchange!.cancelOrder(order.id, this.bot.pair)
        console.info(`🗑️ Cancelled order ${order.id}`)
      }
      
      // Invalidate cache after cancelling orders
      this.invalidateAll()
    }
  }

  async placeOrder(side: 'buy' | 'sell', amount: number, leverage: number = 5): Promise<any> {
    // Calculate limit price (5 ticks under current price)
    // Delete all existing orders for this symbol before placing new one
    const [limitPrice, _ ] = await Promise.all([this.calculateLimitPrice(side, 1), this.cancelAllOrders()])
    
    const order = await this.exchange!.createOrder(this.bot.pair, 'limit', side, amount, limitPrice, {
      leverage: leverage
    })
    
    // Invalidate all caches after placing order
    this.invalidateAll()
    
    return order
  }

  async getBalance(): Promise<Balances> {
    return this.cache.get('balance', CACHE_TIME_SECONDS, async () => {
      console.debug('🔍 Getting balance from exchange')
      const balance = await this.exchange!.fetchBalance({ user: this.user })
      return balance
    })
  }

  async getPositions(): Promise<Position[]> {
    return this.cache.get<Position[]>('positions', CACHE_TIME_SECONDS, async () => {
      console.debug('🔍 Getting positions from exchange')
      const positions = await this.exchange!.fetchPositions(undefined, {
        user: this.user
      })
      return positions
    })
  }

  async getPosition(): Promise<Position> {
    const positions = await this.getPositions()
    const position = positions.find(p => p.symbol === this.bot.pair)
    if (!position) {
      throw new Error(`Position not found for ${this.bot.pair}`)
    }
    return position
  }

  async getAccountCollateral(): Promise<number> {
    const balance = await this.getBalance();
   
    return balance.USDC?.total || 0
  }

  async getMarkets(): Promise<Market[]> {
    return this.cache.get('markets', CACHE_TIME_SECONDS, async () => {
      console.debug('🔍 Fetching markets from Hyperliquid')
      return await this.exchange!.fetchMarkets()
    })
  }

  // Cache invalidation method
  private async invalidateAll(): Promise<void> {
    this.cache = new PromiseCaching({ returnExpired: true });
    console.debug('Invalidated all caches')
  }

}
