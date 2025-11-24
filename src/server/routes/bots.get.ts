import { Request, Response } from 'express'
import { getSupabaseClient } from '../services/supabase'

// GET /api/bots - Get all bots
export default async (req: Request, res: Response) => {
  try {
    const supabase = getSupabaseClient()
    const { data: bots, error } = await supabase
      .from('bots')
      .select('id, name, pair, desired_direction, hyperliquid_user, created_at, updated_at')
      .order('created_at', { ascending: false })

    if (error) {
      return res.status(500).json({ data: null, error: error.message })
    }

    // Convert database rows to Bot objects
    res.json({ data: bots, error: null })
  } catch (error) {
    console.error('Error fetching bots:', error)
    res.status(500).json({ data: null, error: 'Failed to fetch bots' })
  }
}

