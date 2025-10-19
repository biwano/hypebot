import express, { Request, Response } from 'express'
import { getSupabaseClient } from '../services/supabase'
import { BotExecutor } from '../services/bot-executor'

const router = express.Router()
const botExecutor = new BotExecutor()

// GET /api/bots - Get all bots
router.get('/', async (req: Request, res: Response) => {
  try {
    const supabase = getSupabaseClient()
    const { data: bots, error } = await supabase
      .from('bots')
      .select('*')
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
})

// POST /api/bots - Create a new bot
router.post('/', async (req: Request, res: Response) => {
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

    res.json({ data, error: null })
  } catch (error) {
    console.error('Error creating bot:', error)
    res.status(500).json({ data: null, error: 'Failed to create bot' })
  }
})

// GET /api/bots/:id - Get a specific bot
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const supabase = getSupabaseClient()
    
    const { data: bot, error } = await supabase
      .from('bots')
      .select('*')
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
})

// PUT /api/bots/:id - Update a bot
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const updates = req.body

    const supabase = getSupabaseClient()
    const { data: bot, error } = await supabase
      .from('bots')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return res.status(500).json({ data: null, error: error.message })
    }

    // Execute bot if desired_direction changed
    if (updates.desired_direction !== undefined) {
      await botExecutor.executeBot(bot)
    }

    res.json({ data: bot, error: null })
  } catch (error) {
    console.error('Error updating bot:', error)
    res.status(500).json({ data: null, error: 'Failed to update bot' })
  }
})

// DELETE /api/bots/:id - Delete a bot
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const supabase = getSupabaseClient()
    
    const { error } = await supabase
      .from('bots')
      .delete()
      .eq('id', id)

    if (error) {
      return res.status(500).json({ data: null, error: error.message })
    }

    res.json({ data: { success: true }, error: null })
  } catch (error) {
    console.error('Error deleting bot:', error)
    res.status(500).json({ data: null, error: 'Failed to delete bot' })
  }
})


export default router
