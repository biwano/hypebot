import { getSupabaseClient } from '../../services/supabase'

export default defineEventHandler(async (event) => {
  try {
    const botId = getRouterParam(event, 'id')
    const supabase = getSupabaseClient()

    // Get the specific bot
    const { data: bot, error } = await supabase
      .from('bots')
      .select('*')
      .eq('id', botId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          statusMessage: 'Bot not found'
        })
      }
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch bot'
      })
    }

    return { data: bot, error: null }
  } catch (error) {
    console.error('Error fetching bot:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})