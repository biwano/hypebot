import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../../shared/types/database.types'

export function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase URL or Service Role Key environment variables.')
  }

  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey)
}
