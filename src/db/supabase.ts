import { Database } from '../database.types.ts'
import { createClient } from '@supabase'
import '@dotenv/load.ts'

export default createClient<Database>(
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
