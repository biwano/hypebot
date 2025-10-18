import { getSupabaseClient } from '../../services/supabase'

export default defineEventHandler(async (event) => {
  try {
    const botId = getRouterParam(event, 'id')
    const supabase = getSupabaseClient()

    // Delete the bot
    const { error } = await supabase
      .from('bots')
      .delete()
      .eq('id', botId)

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to delete bot'
      })
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Error deleting bot:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})