import { getSupabaseClient } from './supabase'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

async function logToSupabase(level: LogLevel, message: string, botId: string): Promise<void> {
  try {
    const supabase = getSupabaseClient()
    // logs table: level text, message text, meta jsonb, created_at default now()
    const { error } = await supabase.from('logs').insert({ bot_id: botId, log_level: level, log_text: message })
    if (error) {
      // Avoid infinite recursion: use console.error directly here
      console.error('Failed to write log to Supabase:', error.message)
    }
  } catch (err: any) {
    console.error('Failed to initialize Supabase logging:', err?.message || err)
  }
}

function format(message: unknown): string {
  try {
    if (typeof message === 'string') return message
    return JSON.stringify(message)
  } catch {
    return String(message)
  }
}

export const log = {
  debug: async (botId: string, message: unknown): Promise<void> => {
    const msg = format(message)
    console.debug(`Bot ${botId}: ${msg}`)
    await logToSupabase('debug', msg, botId)
  },
  info: async (botId: string, message: unknown): Promise<void> => {
    const msg = format(message)
    console.info(`Bot ${botId}: ${msg}`)
    await logToSupabase('info', msg, botId)
  },
  warn: async (botId: string, message: unknown): Promise<void> => {
    const msg = format(message)
    console.warn(`Bot ${botId}: ${msg}`)
    await logToSupabase('warn', msg, botId)
  },
  error: async (botId: string, message: unknown): Promise<void> => {
    const msg = format(message)
    console.error(`Bot ${botId}: ${msg}`)
    await logToSupabase('error', msg, botId)
  }
}

export default log
