import { getSupabaseClient } from '../../services/supabase'

export default defineEventHandler(async (event) => {
  try {
    const botId = getRouterParam(event, 'id')
    const supabase = getSupabaseClient()

    const body = await readBody(event)
    const { name, pair, desired_direction } = body

    // Update the bot
    const { data: bot, error } = await supabase
      .from('bots')
      .update({
        ...(name && { name }),
        ...(pair && { pair }),
        ...(desired_direction !== undefined && { desired_direction })
      })
      .eq('id', botId)
      .select()
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
        statusMessage: 'Failed to update bot'
      })
    }

    return { data: bot, error: null }
  } catch (error) {
    console.error('Error updating bot:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})