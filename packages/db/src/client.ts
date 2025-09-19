import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

// Lazy initialization to avoid multiple client instances in browser
let _supabase: ReturnType<typeof createClient<Database>> | null = null

export const getSupabaseClient = () => {
  if (!_supabase) {
    _supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      }
    })
  }
  return _supabase
}

// For backwards compatibility, create a getter
export const supabase = new Proxy({} as ReturnType<typeof createClient<Database>>, {
  get(target, prop) {
    return getSupabaseClient()[prop as keyof ReturnType<typeof createClient<Database>>]
  }
})

const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabaseAdmin = supabaseServiceKey && supabaseUrl
    ? createClient<Database>(
        supabaseUrl,
        supabaseServiceKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )
    : null

export { supabaseAdmin }
