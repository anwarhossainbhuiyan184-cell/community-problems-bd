import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? ''

function isValidHttpUrl(value: string) {
  if (!value) return false
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

const hasPlaceholderUrl = /your-project|example\.com/i.test(supabaseUrl)
const hasPlaceholderKey = /^(your-anon-key|your-anon-key-here)$/i.test(supabaseAnonKey)

export const isSupabaseConfigured =
  isValidHttpUrl(supabaseUrl) &&
  Boolean(supabaseAnonKey) &&
  !hasPlaceholderUrl &&
  !hasPlaceholderKey

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

export const REPORT_IMAGE_BUCKET = 'report-images'
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
