import { Database } from "./database.types.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.32.0";
import "https://deno.land/std@0.199.0/dotenv/load.ts";

export default createClient<Database>(
  Deno.env.get("SUPABASE_URL") as string,
  Deno.env.get("SERVICE_KEY") as string,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  },
);
