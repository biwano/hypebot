import type { Bot } from '../../shared/types/index.js'
import { BotThread } from './bot-thread'
import { getSupabaseClient } from './supabase.js'

class BotExecutor {
  private runningBots: Map<string, BotThread>

  constructor() {
    this.runningBots = new Map()
  }

  async executeBot(botId: string): Promise<void> {
    
    // Check if bot is already running
    const existingThread = this.runningBots.get(botId)
    if (existingThread) {
      console.log(`Bot ${botId} is already running, skipping execution`)
      return
    }

    // Create new bot thread
    const botThread = new BotThread(botId)
    this.runningBots.set(botId, botThread)

    try {
      await botThread.execute()
    } finally {
      // Remove from running bots when done
      this.runningBots.delete(botId)
    }
  }

  getRunningBots(): string[] {
    return Array.from(this.runningBots.keys())
  }
}

export const botExecutor = new BotExecutor();


const checkAllBots =async () => {
  const supabase = getSupabaseClient()
  const {data: bots, error} = await supabase.from('bots').select('*').order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching bots:', error)
    return
  }
  bots.forEach(async (bot) => {
    await botExecutor.executeBot(bot.id)
  })
}

checkAllBots();
setInterval(checkAllBots, 60000);