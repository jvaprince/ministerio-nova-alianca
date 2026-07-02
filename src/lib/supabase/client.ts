import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types'

// Singleton pattern para evitar múltiplos clientes no browser
let client: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createSupabaseClient() {
  if (client) return client

  client = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  return client
}
