import { Request, Response } from 'express'
import { getSupabaseClient } from '../services/supabase'

// GET /api/bots/:id - Get a specific bot
export default async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const supabase = getSupabaseClient()
    
    const { data: bot, error } = await supabase
      .from('bots')
      .select('id, name, pair, desired_direction, hyperliquid_user, created_at, updated_at')
      .eq('id', id)
      .single()

    if (error) {
      return res.status(404).json({ data: null, error: 'Bot not found' })
    }

    // Convert database row to Bot object
    res.json({ data: bot, error: null })
  } catch (error) {
    console.error('Error fetching bot:', error)
    res.status(500).json({ data: null, error: 'Failed to fetch bot' })
  }
}

