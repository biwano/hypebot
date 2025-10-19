import ccxt, { Exchange, Position, Market, Balances, Ticker, Num} from 'ccxt'
import { PromiseCaching } from 'promise-caching'
import { CACHE_TIME_SECONDS } from '../../shared/constants'

export class HyperliquidExchange {
  private _exchange: Exchange | null
  private user: string
  private cache: PromiseCaching

  constructor() {
    const privateKey = process.env.HYPERLIQUID_API_PRIVATE_KEY
    const walletAddress = process.env.HYPERLIQUID_API_USER
    this.user = process.env.HYPERLIQUID_USER!

    if (!(privateKey && walletAddress && this.user)) {
      throw new Error('Hyperliquid API credentials not configured')
    }

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

  async getMarket(symbol: string): Promise<Market> {
    return this.cache.get(`market:${symbol}`, CACHE_TIME_SECONDS, async () => {
      console.log(`Getting market for ${symbol} from exchange`)
      const markets = await this.exchange!.fetchMarkets()
      const market = markets.find(m => m?.symbol === symbol)
      if (!market) {
        throw new Error(`Market not found for ${symbol}`)
      }
      return market
    })
  }

  async getTicker(symbol: string): Promise<Ticker> {
    return this.cache.get(`ticker:${symbol}`, CACHE_TIME_SECONDS, async () => {
      console.log(`Getting ticker for ${symbol} from exchange`)
      return await this.exchange!.fetchTicker(symbol)
    })
  }

  public async getPrice(symbol: string, side: 'buy' | 'sell'): Promise<number> {
    const ticker = await this.getTicker(symbol)
    const price = side === 'buy' ? ticker.bid : ticker.ask
    if (!price) {
      throw new Error(`Unable to get price for ${symbol}`)
    }
    return price
  }

  private async calculateLimitPrice(symbol: string, side: 'buy' | 'sell', ticksOffset: number = 5): Promise<number> {
    // Get current ticker price
    const [currentPrice, market] = await Promise.all([this.getPrice(symbol, side),  this.getMarket(symbol)])
    
    if (!currentPrice) {
      throw new Error(`Unable to get current price for ${symbol}`)
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

  async placeOrder(symbol: string, side: 'buy' | 'sell', amount: number, leverage: number = 5): Promise<any> {
    console.log(`Placing ${side} order for ${amount} ${symbol} with ${leverage}x leverage`)
    
    // Calculate limit price (5 ticks under current price)
    const limitPrice = await this.calculateLimitPrice(symbol, side, 5000)
    
    const order = await this.exchange!.createOrder(symbol, 'limit', side, amount, limitPrice, {
      leverage: leverage
    })
    
    // Invalidate all caches after placing order
    this.invalidateAll()
    
    console.log('Order placed:', order)
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
      const positions = await this.exchange!.fetchPositions(undefined, {
        user: this.user
      })
      return positions
    })
  }

  async getPosition(symbol: string): Promise<Position | null> {
    const positions = await this.getPositions()
    return positions.find(p => p.symbol === symbol) || null
  }

  async getAccountCollateral(): Promise<number> {
    const balance = await this.getBalance();
   
    return balance.USDC?.total || 0
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
