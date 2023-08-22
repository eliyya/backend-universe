import { Database } from "./database.types.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.32.0";

export default createClient<Database>(
  Deno.env.get("SUPABASE_URL") as string,
  Deno.env.get("SERVICE_KEY") as string,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false  
    },
  }
)

// class InsertTable<T extends Database, K extends keyof T['public']['Tables']> {
//   client: Supabase<T>
//   name: K
//   data: Partial<T['public']['Tables'][K]> | Array<Partial<T['public']['Tables'][K]>>
//   constructor(client: Supabase<T>, name: K, data: Partial<T['public']['Tables'][K]> | Array<Partial<T['public']['Tables'][K]>>) {
//     this.client = client
//     this.name = name
//     this.data = data
//   }

//   async insert(): Promise<Partial<T['public']['Tables'][K]>> {
//     const req = await fetch(`${this.client.url}/rest/v1/${String(this.name)}`, {

//       method: "POST",
//       headers: {
//         apikey: this.client.key,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(this.data),
//     }).then((res) => res.json())
//     return req
//   }
// }

// class Table<T extends Database, K extends keyof T['public']['Tables']> {
//   client: Supabase<T>
//   name: K
//   query = new URLSearchParams()

//   constructor(client: Supabase<T>, name: K) {
//     this.client = client
//     this.name = name
//   }

//   eq<U extends keyof T['public']['Tables'][K]>(match: U, value: T['public']['Tables'][K][U]) {
//     this.query.append(String(match), `eq.${value}`)
//     return this
//   }

//   async select(columns = "*"): Promise<Array<Partial<T['public']['Tables'][K]>>> {
//     this.query.append("select", columns)
//     const req = await fetch(`${this.client.url}/rest/v1/${String(this.name)}?${this.query.toString()}`, {
//       method: "GET",
//       headers: {
//         apikey: this.client.key,
//         "Content-Type": "application/json",
//       },
//     }).then((res) => res.json())
//     return req
//   }

//   async insert(data: Partial<T['public']['Tables'][K]> | Array<Partial<T['public']['Tables'][K]>>): Promise<Partial<T['public']['Tables'][K]>> {
//     const req = await fetch(`${this.client.url}/rest/v1/${String(this.name)}`, {
//       method: "POST",
//       headers: {
//         apikey: this.client.key,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(data),
//     }).then((res) => res.json())
//     return req
//   }
// }

// class Supabase<T extends Database> {
//   url: string
//   key: string
//   constructor(url: string, key: string) {
//     this.url = url
//     this.key = key
//   }

//   from<K extends keyof T['public']['Tables']>(name: K) {
//     return new Table(this, name)
//   }
// }

// export default new Supabase<Database>(Deno.env.get("SUPABASE_URL") as string, Deno.env.get("SUPABASE_PUBLIC_KEY") as string)
