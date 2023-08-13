import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";
import { Database } from "./database.types.ts";

export default createClient<Database>(
  Deno.env.get("SUPABASE_URL") as string,
  Deno.env.get("SUPABASE_PUBLIC_KEY") as string,
);
