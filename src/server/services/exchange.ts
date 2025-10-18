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
        // Mock response when exchange is not available
        return {
          symbol,
          size: 0,
          side: 'long',
          entryPrice: 0,
          unrealizedPnl: 0
        }
      }

      console.log(`Getting position for ${symbol}`)
      const positions = await this.exchange.fetchPositions([symbol])
      const position = positions.find(p => p.symbol === symbol)
      
      if (position) {
        return {
          symbol: position.symbol,
          size: position.contracts,
          side: position.side as 'long' | 'short',
          entryPrice: position.entryPrice,
          unrealizedPnl: position.unrealizedPnl
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
        console.log(`Exchange not available - simulating ${side} order for ${amount} ${symbol}`)
        return true
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
        console.log(`Exchange not available - simulating position close for ${symbol}`)
        return true
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
        return {
          balance: 10000,
          positions: []
        }
      }

      const balance = await this.exchange.fetchBalance({}, { user: this.user })
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
        console.log('Exchange not available - returning mock USDC balance')
        return 10000.50
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

  async getAccountBalance(): Promise<{ usdcBalance: number }> {
    try {
      const usdcBalance = await this.getUSDCBalance()
      return { usdcBalance }
    } catch (error) {
      console.error('Error getting account balance:', error)
      return { usdcBalance: 0 }
    }
  }
}
