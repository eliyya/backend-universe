import { createClient } from "https://deno.land/x/supabase@1.3.1/mod.ts";
// import { Database } from "./database.types.ts";

export default createClient(
  Deno.env.get("SUPABASE_URL") as string,
  Deno.env.get("SUPABASE_PUBLIC_KEY") as string,
);
