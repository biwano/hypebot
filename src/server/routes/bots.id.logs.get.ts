import { Request, Response } from 'express'
import { getSupabaseClient } from '../services/supabase'

// GET /api/bots/:id/logs?levels=info&levels=warn
export default async (req: Request, res: Response) => {
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
}

