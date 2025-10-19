import ccxt, { Exchange, Position, Market, Balances, Ticker} from 'ccxt'
import { PromiseCaching } from 'promise-caching'
import { CACHE_TIME_SECONDS } from '../../shared/constants'

export class HyperliquidExchange {
  private _exchange: Exchange | null
  private user: string
  private cache: PromiseCaching

  constructor() {
    const apiKey = process.env.HYPERLIQUID_API_KEY
    const secret = process.env.HYPERLIQUID_SECRET_KEY
    const walletAddress = process.env.HYPERLIQUID_WALLET_ADDRESS
    this.user = process.env.HYPERLIQUID_USER!


    if (!!(apiKey && secret && this.user)) {
      throw new Error('Hyperliquid API credentials not configured')
    }

    // Use the actual Hyperliquid exchange from CCXT
    this._exchange = new ccxt.hyperliquid({
      apiKey,
      secret,
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

  async getMarket(symbol: string): Promise<Market | null> {
    return this.cache.get(`market:${symbol}`, CACHE_TIME_SECONDS, async () => {
      console.log(`Getting market for ${symbol} from exchange`)
      const markets = await this.exchange!.fetchMarkets()
      const market = markets.find(m => m?.symbol === symbol)
      return market || null
    })
  }

  async getTicker(symbol: string): Promise<Ticker> {
    return this.cache.get(`ticker:${symbol}`, CACHE_TIME_SECONDS, async () => {
      console.log(`Getting ticker for ${symbol} from exchange`)
      return await this.exchange!.fetchTicker(symbol)
    })
  }

  async placeOrder(symbol: string, side: 'buy' | 'sell', amount: number, leverage: number = 5): Promise<any> {
    console.log(`Placing ${side} order for ${amount} ${symbol} with ${leverage}x leverage`)
    
    const order = await this.exchange!.createOrder(symbol, 'market', side, amount, undefined, {
      leverage: leverage
    })
    
    // Invalidate all caches after placing order
    this.invalidateAll()
    
    console.log('Order placed:', order)
    return order
  }

  async closePosition(symbol: string): Promise<any> {
    console.log(`Closing position for ${symbol}`)
    
    // Get current position to determine size and side
    const position = await this.getPosition(symbol)
    if (!position || position.contracts === 0) {
      console.log(`No position to close for ${symbol}`)
      return null
    }

    // Close position by placing opposite order
    const closeSide = position.side === 'long' ? 'sell' : 'buy'
    const order = await this.exchange!.createOrder(symbol, 'market', closeSide, position.contracts || 0)
    
    // Invalidate all caches after closing position
    this.invalidateAll()
    
    console.log('Position closed:', order)
    return order
  }

  async getBalance(): Promise<Balances> {
    return this.cache.get('balance', CACHE_TIME_SECONDS, async () => {
      console.log('Getting balance from exchange')
      const balance = await this.exchange!.fetchBalance({ user: this.user })
      return balance
    })
  }

  async getPositions(): Promise<Position[]> {
    return this.cache.get<Position[]>('positions', CACHE_TIME_SECONDS, async () => {
      console.log('Getting positions from exchange')
      const positions = await this.exchange!.fetchPositions([], {
        user: this.user
      })
      return positions
    })
  }

  async getPosition(symbol: string): Promise<Position | null> {
    const positions = await this.getPositions()
    return positions.find(p => p.symbol === symbol) || null
  }

  async getUSDCBalance(): Promise<number> {
    console.log('Getting USDC balance from Hyperliquid')
    const balance = await this.exchange!.fetchBalance({ user: this.user })
    
    return balance.USDC?.free || 0
  }

  async getMarkets(): Promise<Market[]> {
    return this.cache.get('markets', CACHE_TIME_SECONDS, async () => {
      console.log('Fetching markets from Hyperliquid')
      return await this.exchange!.fetchMarkets()
    })
  }

  // Cache invalidation method
  private invalidateAll(): void {
    this.cache = new PromiseCaching({ returnExpired: true });
    console.log('Invalidated all caches');
  }

}
