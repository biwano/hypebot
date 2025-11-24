import { Request, Response } from 'express'
import { getSupabaseClient } from '../services/supabase'

// DELETE /api/bots/:id - Delete a bot
export default async (req: Request, res: Response) => {
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
}

