import type { Database } from './database.types'

// Raw database type with nullable fields
export type Bot = Database['public']['Tables']['bots']['Row']

export interface Signal {
  desired_direction: number
}

export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

