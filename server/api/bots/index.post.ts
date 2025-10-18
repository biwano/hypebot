import { getSupabaseClient } from '../../services/supabase'

export default defineEventHandler(async (event) => {
  try {
    const supabase = getSupabaseClient()

    const body = await readBody(event)
    const { name, pair, desired_direction = 0 } = body

    if (!name || !pair) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name and pair are required'
      })
    }

    // Create the bot (no user_id needed)
    const { data: bot, error } = await supabase
      .from('bots')
      .insert({
        name,
        pair,
        desired_direction
      })
      .select()
      .single()

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create bot'
      })
    }

    return { data: bot, error: null }
  } catch (error) {
    console.error('Error creating bot:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})