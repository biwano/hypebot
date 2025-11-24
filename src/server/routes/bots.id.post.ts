import { Request, Response } from 'express'
import { getSupabaseClient } from '../services/supabase'
import { botExecutor } from '../services/bot-executor'
import log from '../services/log'

// POST /api/bots/:id - Update a bot
export default async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const updates = { ...req.body }

    // Don't save hyperliquid_private_key if it's empty
    if (updates.hyperliquid_private_key !== undefined) {
      if (!updates.hyperliquid_private_key || updates.hyperliquid_private_key.trim() === '') {
        delete updates.hyperliquid_private_key
      }
    }

    const supabase = getSupabaseClient()

    const {data: oldBot} = await supabase.from('bots').select('*').eq('id', id).single()

    const { data: bot, error } = await supabase
      .from('bots')
      .update(updates)
      .eq('id', id)
      .select('id, name, pair, desired_direction, hyperliquid_user, created_at, updated_at')
      .single()

    if (error) {
      return res.status(500).json({ data: null, error: error.message })
    }
    await log.info(bot.id, `Updated`)

    // Execute bot if desired_direction changed
    if (updates.desired_direction !== oldBot.desired_direction) {
      await log.info(bot.id, `New direction: ${updates.desired_direction}`)
      await botExecutor.executeBot(bot.id)
    }

    res.json({ data: bot, error: null })
  } catch (error) {
    console.error('Error updating bot:', error)
    res.status(500).json({ data: null, error: 'Failed to update bot' })
  }
}

