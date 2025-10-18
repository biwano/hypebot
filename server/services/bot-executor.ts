import { HyperliquidExchange } from './exchange'
import type { Bot } from '../../shared/types'

export class BotExecutor {
  private exchange: HyperliquidExchange
  private runningBots: Map<string, boolean> = new Map()

  constructor() {
    this.exchange = new HyperliquidExchange()
  }

  async executeBot(bot: Bot): Promise<boolean> {
    const botId = bot.id
    
    // Prevent concurrent execution for the same bot
    if (this.runningBots.get(botId)) {
      console.log(`Bot ${botId} is already running, skipping execution`)
      return false
    }

    this.runningBots.set(botId, true)

    try {
      console.log(`Executing bot ${bot.name} (${bot.pair}) with desired_direction: ${bot.desired_direction}`)
      
      const { desired_direction, pair } = bot
      
      if (desired_direction === 0) {
        // Exit position
        await this.exchange.closePosition(pair)
        console.log(`Closed position for ${pair}`)
      } else {
        // Calculate position size and direction
        const side = desired_direction > 0 ? 'buy' : 'sell'
        const leverage = Math.min(Math.abs(desired_direction), 5) // Cap at 5x leverage
        const amount = Math.abs(desired_direction) // Simplified amount calculation
        
        // Place order
        const success = await this.exchange.placeOrder(pair, side, amount, leverage)
        
        if (success) {
          console.log(`Placed ${side} order for ${amount} ${pair} with ${leverage}x leverage`)
        } else {
          console.error(`Failed to place order for ${pair}`)
          return false
        }
      }
      
      return true
    } catch (error) {
      console.error(`Error executing bot ${botId}:`, error)
      return false
    } finally {
      this.runningBots.set(botId, false)
    }
  }

  async executeAllBots(bots: Bot[]): Promise<void> {
    console.log(`Executing ${bots.length} bots`)
    
    // Execute bots sequentially to avoid rate limits
    for (const bot of bots) {
      await this.executeBot(bot)
      // Add small delay between bot executions
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  isBotRunning(botId: string): boolean {
    return this.runningBots.get(botId) || false
  }
}
