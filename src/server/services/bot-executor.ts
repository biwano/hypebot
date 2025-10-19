import { HyperliquidExchange } from './exchange'
import type { Bot } from '../../shared/types/index.js'
import { BASE_LEVERAGE } from '../../shared/constants'



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
      
       
        // current Notional
        const [ currentPosition, currentCollateral] = await Promise.all([this.exchange.getPosition(bot.pair), this.exchange.getAccountCollateral()])
        const currentMultiplier = currentPosition?.side === 'long' ? 1 : -1
        let currentNotional = 0
        if (currentPosition && currentPosition.notional) {
          currentNotional = currentPosition.notional * currentMultiplier
        }

        // Wanted Notional
        const wantedNotional= bot.desired_direction * BASE_LEVERAGE * currentCollateral

        // Amount and side
        const absoluteAmountUSD = wantedNotional - currentNotional
        const side = absoluteAmountUSD > 0 ? 'buy' : 'sell'
        const amount = Math.abs(absoluteAmountUSD) 

        console.log(`Current: ${currentNotional} notional, Desired: ${wantedNotional} notional, Order: ${amount} ${side}`)
        
        if (Math.abs(amount) < currentCollateral * BASE_LEVERAGE / 10) {
          console.log(`Bot ${botId} already at desired position, no order needed`)
          return
        }

        const price = await this.exchange.getPrice(bot.pair, side)

        const amountToken = amount / price
        
        const success = await this.exchange.placeOrder(bot.pair, side, amountToken, 5)
          
        if (success) {
          console.log(`Successfully placed ${side} order for ${amount} contracts on bot ${botId}`)
        } else {
          console.error(`Failed to place order for bot ${botId}`)
        }
        return
      
        
       
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
