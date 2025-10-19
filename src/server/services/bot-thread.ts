import { HyperliquidExchange } from './exchange'
import type { Bot } from '../../shared/types/index.js'
import { BASE_LEVERAGE } from '../../shared/constants'

export class BotThread {
  private bot: Bot
  private exchange: HyperliquidExchange

  constructor(bot: Bot) {
    this.bot = bot
    this.exchange = new HyperliquidExchange()
  }

  async execute(): Promise<void> {
    await this.handlePositionAdjustment()
  }

  private async handlePositionAdjustment(): Promise<void> {
    // Get current position and collateral
    if (this.bot.desired_direction == 0) {
        const currentPosition = await this.exchange.getPosition(this.bot.pair)
        if (!currentPosition.contractSize || !currentPosition.contracts || !currentPosition.side) {
            throw new Error(`Position not found for ${this.bot.pair}`)
        }
        const side = currentPosition.side == 'long' ? 'sell' : 'buy'
        const amountToken = currentPosition.contractSize  * currentPosition.contracts
        await this.exchange.placeOrder(this.bot.pair, side, amountToken, 5)
    
    } else {
        const [currentPosition, currentCollateral] = await Promise.all([
        this.exchange.getPosition(this.bot.pair),
        this.exchange.getAccountCollateral()
        ])
        
        const currentMultiplier = currentPosition?.side === 'long' ? 1 : -1
        let currentNotional = 0
        if (currentPosition && currentPosition.notional) {
        currentNotional = currentPosition.notional * currentMultiplier
        }

        // Calculate wanted notional
        const wantedNotional = this.bot.desired_direction * BASE_LEVERAGE * currentCollateral

        // Calculate order amount and side
        const absoluteAmountUSD = wantedNotional - currentNotional
        const side = absoluteAmountUSD > 0 ? 'buy' : 'sell'
        const amount = Math.abs(absoluteAmountUSD)

        console.log(`📊 Current notional: ${currentNotional} notional. Desired notional: ${wantedNotional}`)
        
        // Check if order is significant enough
        if (Math.abs(amount) < currentCollateral * BASE_LEVERAGE / 10) {
        console.log(`✅ Bot ${this.bot.id} already at desired position, no order needed`)
        return
        }

        // Get current price and convert to token amount
        const price = await this.exchange.getPrice(this.bot.pair, side)
        const amountToken = amount / price
        
        // Place the order
        await this.exchange.placeOrder(this.bot.pair, side, amountToken, 5)
    }
  }

  get botId(): string {
    return this.bot.id
  }

}
