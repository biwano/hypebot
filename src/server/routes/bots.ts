import express, { Request, Response } from 'express'
import { getSupabaseClient } from '../services/supabase'
import { botExecutor } from '../services/bot-executor'
import log from '../services/log'

const router = express.Router()

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
    await log.info(data.id, `Created`)

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

// POST /api/bots/:id - Update a bot
router.post('/:id', async (req: Request, res: Response) => {
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
    await log.info(bot.id, `Updated`)

    // Execute bot if desired_direction changed
    if (updates.desired_direction !== undefined) {
      await log.info(bot.id, `New direction: ${updates.desired_direction}`)
      await botExecutor.executeBot(bot.id)
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


// GET /api/bots/:id/logs?levels=info&levels=warn
router.get('/:id/logs', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const levelsParam = req.query.levels
    const pageParam = req.query.page
    const itemsPerPageParam = req.query.itemsPerPage

    // Normalize levels to array of strings; if not provided, return all levels
    let levels: string[] | null = null
    if (Array.isArray(levelsParam)) {
      levels = levelsParam.map(String)
    } else if (typeof levelsParam === 'string') {
      levels = [levelsParam]
    }

    // Pagination: page is 1-based in UI; default page=1, itemsPerPage=10
    const page = typeof pageParam === 'string' ? parseInt(pageParam, 10) : Array.isArray(pageParam) ? parseInt(pageParam[0] as string, 10) : 1
    const itemsPerPage = typeof itemsPerPageParam === 'string' ? parseInt(itemsPerPageParam, 10) : Array.isArray(itemsPerPageParam) ? parseInt(itemsPerPageParam[0] as string, 10) : 10
    const from = (isNaN(page) || page < 1 ? 0 : (page - 1) * (isNaN(itemsPerPage) ? 10 : itemsPerPage))
    const to = from + (isNaN(itemsPerPage) ? 10 : itemsPerPage) - 1

    const supabase = getSupabaseClient()

    let query = supabase
      .from('logs')
      .select('*', { count: 'exact', head: false })
      .eq('bot_id', id)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (levels && levels.length > 0) {
      query = query.in('log_level', levels)
    }

    const { data: logs, error, count } = await query

    if (error) {
      return res.status(500).json({ data: null, error: error.message })
    }

    res.json({ data: { items: logs, total: count ?? 0 }, error: null })
  } catch (error) {
    console.error('Error fetching bot logs:', error)
    res.status(500).json({ data: null, error: 'Failed to fetch bot logs' })
  }
})


export default router
