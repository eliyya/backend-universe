import { Database } from './supabase.types.ts'
import { createClient } from '@supabase'
import '@dotenv/load.ts'

export const supabase = createClient<Database>(
    Deno.env.get('SUPABASE_URL') as string,
    Deno.env.get('SERVICE_KEY') as string,
    {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
        },
    },
)

export const db = supabase.schema('universe')
export const storage = supabase.storage.from('universe')
export * from './supabase.types.ts'