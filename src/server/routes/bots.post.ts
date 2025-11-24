import { Request, Response } from 'express'
import { getSupabaseClient } from '../services/supabase'
import log from '../services/log'

// POST /api/bots - Create a new bot
export default async (req: Request, res: Response) => {
  try {
    const { name, pair } = req.body

    if (!name || !pair) {
      return res.status(400).json({ data: null, error: 'Name and pair are required' })
    }

    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('bots')
      .insert([{ name, pair, desired_direction: 0 }])
      .select()
      .single()

    if (error) {
      return res.status(500).json({ data: null, error: error.message })
    }
    await log.info(data.id, `Created`)

    res.json({ data, error: null })
  } catch (error) {
    console.error('Error creating bot:', error)
    res.status(500).json({ data: null, error: 'Failed to create bot' })
  }
}

