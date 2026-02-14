'use client'

import { createClient } from '@supabase/supabase-js'

let supabaseInstance: ReturnType<typeof createClient> | null = null

function getSupabaseClient() {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Missing Supabase environment variables')
      throw new Error('Missing Supabase environment variables')
    }

    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseInstance
}

export type CustomLevel = {
  id: string
  name: string
  subtitle: string
  platforms: Array<{ x: number; y: number; w: number; h: number }>
  walls: Array<{ x: number; y: number; w: number; h: number; isThin: boolean }>
  playerStart: { x: number; y: number }
  playerStart2: { x: number; y: number }
  flag: { x: number; y: number }
  created_at: string
  updated_at: string
}

export async function loadCustomLevels(): Promise<CustomLevel[]> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('custom_levels')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading custom levels:', error)
      return []
    }

    return (data as CustomLevel[]) || []
  } catch (e) {
    console.error('Failed to load custom levels:', e)
    return []
  }
}

export async function saveCustomLevel(level: Omit<CustomLevel, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('custom_levels')
      .insert({
        name: level.name,
        subtitle: level.subtitle,
        platforms: level.platforms,
        walls: level.walls,
        playerStart: level.playerStart,
        playerStart2: level.playerStart2,
        flag: level.flag,
      })
      .select()

    if (error) {
      console.error('Error saving custom level:', error)
      throw error
    }

    return data?.[0] as CustomLevel
  } catch (e) {
    console.error('Failed to save custom level:', e)
    throw e
  }
}

export async function deleteCustomLevel(id: string) {
  try {
    const supabase = getSupabaseClient()
    const { error } = await supabase
      .from('custom_levels')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting custom level:', error)
      throw error
    }
  } catch (e) {
    console.error('Failed to delete custom level:', e)
    throw e
  }
}
