import ccxt, { Exchange} from 'ccxt'
import type { ExchangePosition } from '../../shared/types.js'

export class HyperliquidExchange {
  private exchange: Exchange | null
  private hasCredentials: boolean
  private user: string

  constructor() {
    const apiKey = process.env.HYPERLIQUID_API_KEY
    const secret = process.env.HYPERLIQUID_SECRET_KEY
    this.user = process.env.HYPERLIQUID_USER!

    this.hasCredentials = !!(apiKey && secret && this.user)

    if (this.hasCredentials) {
      // Use the actual Hyperliquid exchange from CCXT
      this.exchange = new ccxt.hyperliquid({
        apiKey,
        secret,
        options: {
          defaultType: 'future'
        }
      })
    } else {
      console.warn('Hyperliquid API credentials not configured - using mock mode')
      this.exchange = null
    }
  }

  async getPosition(symbol: string): Promise<ExchangePosition | null> {
    try {
      if (!this.exchange) {
        return null
      }

      console.log(`Getting position for ${symbol}`)
      const positions = await this.exchange.fetchPositions([symbol])
      const position = positions.find(p => p.symbol === symbol)
      
      if (position) {
        return {
          symbol: position.symbol,
          size: position.contracts || 0,
          side: position.side as 'long' | 'short',
          entryPrice: position.entryPrice || 0,
          unrealizedPnl: position.unrealizedPnl || 0
        }
      }
      
      return null
    } catch (error) {
      console.error('Error getting position:', error)
      return null
    }
  }

  async placeOrder(symbol: string, side: 'buy' | 'sell', amount: number, leverage: number = 5): Promise<boolean> {
    try {
      if (!this.exchange) {
        return false
      }

      console.log(`Placing ${side} order for ${amount} ${symbol} with ${leverage}x leverage`)
      
      const order = await this.exchange.createOrder(symbol, 'market', side, amount, undefined, {
        leverage: leverage
      })
      
      console.log('Order placed:', order)
      return true
    } catch (error) {
      console.error('Error placing order:', error)
      return false
    }
  }

  async closePosition(symbol: string): Promise<boolean> {
    try {
      if (!this.exchange) {
        return false
      }

      console.log(`Closing position for ${symbol}`)
      
      // Get current position to determine size and side
      const position = await this.getPosition(symbol)
      if (!position || position.size === 0) {
        console.log(`No position to close for ${symbol}`)
        return true
      }

      // Close position by placing opposite order
      const closeSide = position.side === 'long' ? 'sell' : 'buy'
      const order = await this.exchange.createOrder(symbol, 'market', closeSide, position.size)
      
      console.log('Position closed:', order)
      return true
    } catch (error) {
      console.error('Error closing position:', error)
      return false
    }
  }

  async getAccountInfo(): Promise<{ balance: number; positions: any[] } | null> {
    try {
      if (!this.exchange) {
        return null
      }

      const balance = await this.exchange.fetchBalance({ user: this.user })
      const positions = await this.exchange.fetchPositions()

      console.log('Balance:', balance)
      console.log('Positions:', positions)
      return {
        balance: balance.USDC?.free || 0,
        positions: positions
      }
    } catch (error) {
      console.error('Error getting account info:', error)
      return null
    }
  }

  async getUSDCBalance(): Promise<number> {
    try {
      if (!this.exchange) {
        return 0
      }

      console.log('Getting USDC balance from Hyperliquid')
      // Hyperliquid requires a user parameter for fetchBalance
      const balance = await this.exchange.fetchBalance({ user: this.user })
      
      return balance.USDC?.free || 0
    } catch (error) {
      console.error('Error getting USDC balance:', error)
      return 0
    }
  }

  async getAccountBalance(): Promise<{ usdcBalance: number } | null> {
    try {
      if (!this.exchange) {
        return null
      }
      
      const usdcBalance = await this.getUSDCBalance()
      return { usdcBalance }
    } catch (error) {
      console.error('Error getting account balance:', error)
      return null
    }
  }

  async getTradingPairs(): Promise<any[]> {
    try {
      if (!this.exchange) {
        return []
      }

      console.log('Fetching trading pairs from Hyperliquid')
      const markets = await this.exchange.fetchMarkets()
      
      return markets.map(market => ({
        symbol: market?.symbol || '',
        base: market?.base || '',
        quote: market?.quote || '',
        active: market?.active || false,
        type: market?.type || '',
        spot: market?.spot || false,
        margin: market?.margin || false,
        future: market?.future || false,
        option: market?.option || false,
        contract: market?.contract || false,
        settle: market?.settle || '',
        settleId: market?.settleId || '',
        contractSize: market?.contractSize || 0,
        linear: market?.linear || false,
        inverse: market?.inverse || false,
        taker: market?.taker || 0,
        maker: market?.maker || 0,
        limits: market?.limits || {},
        info: market?.info || {}
      }))
    } catch (error) {
      console.error('Error getting trading pairs:', error)
      return []
    }
  }
}
