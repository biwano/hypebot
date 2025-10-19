import type { Bot } from '../../shared/types/index.js'
import { BotThread } from './bot-thread'

export class BotExecutor {
  private runningBots: Map<string, BotThread>

  constructor() {
    this.runningBots = new Map()
  }

  async executeBot(bot: Bot): Promise<void> {
    const botId = bot.id
    
    // Check if bot is already running
    const existingThread = this.runningBots.get(botId)
    if (existingThread) {
      console.log(`Bot ${botId} is already running, skipping execution`)
      return
    }

    // Create new bot thread
    const botThread = new BotThread(bot)
    this.runningBots.set(botId, botThread)

    try {
      await botThread.execute()
    } finally {
      // Remove from running bots when done
      this.runningBots.delete(botId)
    }
  }

  async executeAllBots(bots: Bot[]): Promise<void> {
    console.log(`🤖 Executing ${bots.length} bots`)
    
    for (const bot of bots) {
      await this.executeBot(bot)
    }
  }

  getRunningBots(): string[] {
    return Array.from(this.runningBots.keys())
  }
}
