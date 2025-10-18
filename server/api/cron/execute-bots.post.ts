import { getSupabaseClient } from '../../services/supabase'
import { BotExecutor } from '../../services/bot-executor'

export default defineEventHandler(async (event) => {
  try {
    // This endpoint can be called by external cron services
    // or by a scheduled task within the application
    const supabase = getSupabaseClient()
    
    // Get all active bots (you might want to add an 'active' field to filter)
    const { data: bots, error } = await supabase
      .from('bots')
      .select('*')

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch bots'
      })
    }

    if (!bots || bots.length === 0) {
      return { message: 'No bots to execute', executed: 0 }
    }

    // Execute all bots
    const botExecutor = new BotExecutor()
    await botExecutor.executeAllBots(bots)

    return { 
      message: `Executed ${bots.length} bots`, 
      executed: bots.length 
    }
  } catch (error) {
    console.error('Error executing bots:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})