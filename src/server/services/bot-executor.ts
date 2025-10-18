import { HyperliquidExchange } from './exchange'
import type { Bot } from '../../shared/types'

export class BotExecutor {
  private exchange: HyperliquidExchange | null
  private runningBots: Map<string, boolean>

  constructor() {
    try {
      this.exchange = new HyperliquidExchange()
    } catch (error) {
      console.warn('Failed to initialize exchange:', (error as Error).message)
      this.exchange = null
    }
    this.runningBots = new Map()
  }

  async executeBot(bot: Bot): Promise<void> {
    const botId = bot.id
    
    // Prevent concurrent execution for the same bot
    if (this.runningBots.get(botId)) {
      console.log(`Bot ${botId} is already running, skipping execution`)
      return
    }

    this.runningBots.set(botId, true)

    try {
      console.log(`Executing bot ${botId} with desired direction: ${bot.desired_direction}`)
      
      if (!this.exchange) {
        console.log(`Exchange not available - simulating bot execution for ${botId}`)
        return
      }
      
      if (bot.desired_direction === 0) {
        // Exit position
        await this.exchange.closePosition(bot.pair)
        console.log(`Closed position for bot ${botId}`)
      } else {
        // Place order based on desired direction
        const side = bot.desired_direction > 0 ? 'buy' : 'sell'
        const amount = Math.abs(bot.desired_direction) * 1000 // Mock amount calculation
        const leverage = 5
        
        const success = await this.exchange.placeOrder(bot.pair, side, amount, leverage)
        
        if (success) {
          console.log(`Successfully placed ${side} order for bot ${botId}`)
        } else {
          console.error(`Failed to place order for bot ${botId}`)
        }
      }
    } catch (error) {
      console.error(`Error executing bot ${botId}:`, error)
    } finally {
      this.runningBots.set(botId, false)
    }
  }

  async executeAllBots(bots: Bot[]): Promise<void> {
    console.log(`Executing ${bots.length} bots`)
    
    for (const bot of bots) {
      await this.executeBot(bot)
    }
  }
}
