import { supabaseClient } from "https://deno.land/x/supabase_deno@v1.0.5/mod.ts";
// import { Database } from "./database.types.ts";

export default new supabaseClient(
  Deno.env.get("SUPABASE_URL") as string,
  Deno.env.get("SUPABASE_PUBLIC_KEY") as string,
);


