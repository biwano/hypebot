import { HyperliquidExchange } from './exchange'
import type { Bot } from '../../shared/types/index.js'
import { BASE_LEVERAGE } from '../../shared/constants'
import { getSupabaseClient } from './supabase.js'
import { botExecutor } from './bot-executor'

export class BotThread {
  private botId: string
  private exchange: HyperliquidExchange

  constructor(botId: string) {
    this.botId = botId
    this.exchange = new HyperliquidExchange()
  }

  async execute(): Promise<void> {
    let positionAdjusted: Boolean = false
    try {
        positionAdjusted = await this.handlePositionAdjustment()
    } finally {
        if (!positionAdjusted) {
            console.log(`Bot ${this.botId} is not at desired position, retrying in 60 seconds`)
            setTimeout(() => {
               botExecutor.executeBot(this.botId)
            }, 60000)
        }
    }

  }

  private async handlePositionAdjustment(): Promise<Boolean> {
    const supabase = getSupabaseClient()
    const {data: bot, error} = await supabase.from('bots').select('*').eq('id', this.botId).single()
    if (error) {
        throw new Error(`Error fetching bot for id ${this.botId}: ${error.message}`)
    }
    // Get current position and collateral
    if (bot.desired_direction == 0) {
        const currentPosition = await this.exchange.getPosition(bot.pair)
        if (!currentPosition.contractSize || !currentPosition.contracts || !currentPosition.side) {
            return true
        }
        const side = currentPosition.side == 'long' ? 'sell' : 'buy'
        const amountToken = currentPosition.contractSize  * currentPosition.contracts
        await this.exchange.placeOrder(bot.pair, side, amountToken, 5)
    
    } else {
        const [currentPosition, currentCollateral] = await Promise.all([
        this.exchange.getPosition(bot.pair),
        this.exchange.getAccountCollateral()
        ])
        
        const currentMultiplier = currentPosition?.side === 'long' ? 1 : -1
        let currentNotional = 0
        if (currentPosition && currentPosition.notional) {
        currentNotional = currentPosition.notional * currentMultiplier
        }

        // Calculate wanted notional
        const wantedNotional = bot.desired_direction * BASE_LEVERAGE * currentCollateral

        // Calculate order amount and side
        const absoluteAmountUSD = wantedNotional - currentNotional
        const side = absoluteAmountUSD > 0 ? 'buy' : 'sell'
        const amount = Math.abs(absoluteAmountUSD)

        console.log(`📊 Current notional: ${currentNotional} notional. Desired notional: ${wantedNotional}`)
        
        // Check if order is significant enough
        if (Math.abs(amount) < currentCollateral * BASE_LEVERAGE / 10) {
        console.log(`✅ Bot ${bot.id} already at desired position, no order needed`)
        return true
        }

        // Get current price and convert to token amount
        const price = await this.exchange.getPrice(bot.pair, side)
        const amountToken = amount / price
        
        // Place the order
        await this.exchange.placeOrder(bot.pair, side, amountToken, 5)
    }
    return false
  }
}
