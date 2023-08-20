// import { Database } from "./database.types.ts";

class Table {
  client: Supabase
  name: string
  query = new URLSearchParams()
  constructor(client: Supabase, name: string) {
    this.client = client
    this.name = name
  }

  eq(match: string, value: string) {
    this.query.append(match, `eq.${value}`)
    return this
  }

  async select(columns = "*") {
    this.query.append("select", columns)
    const req = await fetch(`${this.client.url}/rest/v1/${this.name}?${this.query.toString()}`, {
      method: "GET",
      headers: {
        apikey: this.client.key,
        "Content-Type": "application/json",
      },
    }).then((res) => res.json())
    return req
  }
}

class Supabase {
  url: string
  key: string
  constructor(url: string, key: string) {
    this.url = url
    this.key = key
  }

  from(name: string) {
    return new Table(this, name)
  }
}

export default new Supabase(Deno.env.get("SUPABASE_URL") as string, Deno.env.get("SUPABASE_PUBLIC_KEY") as string)
