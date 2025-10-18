import { getSupabaseClient } from '../../services/supabase'

export default defineEventHandler(async (event) => {
  try {
    const supabase = getSupabaseClient()

    // Get all bots (no user filtering needed)
    const { data: bots, error } = await supabase
      .from('bots')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch bots'
      })
    }

    return { data: bots, error: null }
  } catch (error) {
    console.error('Error fetching bots:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})