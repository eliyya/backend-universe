import { z } from "https://deno.land/x/zod@v3.21.4/mod.ts";
import { compare, hash } from "../utils/hash.ts";
import { SignJWT, jwtVerify } from 'https://deno.land/x/jose@v4.14.4/index.ts'

const secret = new TextEncoder().encode(Deno.env.get("JWT_SECRET") as string)
import supabase from "../supabase.ts";
import { Table } from "../database.types.ts";
export default class User {
  static schema = z.object({
    id: z.string().uuid(),
    username: z.string(),
    email: z.string().email(),
    avatar: z.string().url().nullable(),
    created_at: z.string().nullable(),
    displayname: z.string().nullable(),
  });

  static async generateToken(email: string, password: string) {
    const req = await supabase.from("users").select().eq("email", email);
    if (req.status !== 200) throw new Error(JSON.stringify(req));
    if (!req.data?.length) return { error: "Invalid user or password" };
    const [u] = req.data;
    if (!(await compare(password, u.password))) {
      return { error: "Invalid user or password" };
    }
    const user = User.schema.safeParse(u)
    if (!user.success) throw new Error(JSON.stringify(user.error));
    const expires = Date.now() + 60 * 60 * 24;
    const token = await new SignJWT({ user: user.data, expires })
      .setProtectedHeader({ alg: 'HS256' })
      .sign(secret)
    return { token, expires };
  }

  static async decodeToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, secret);
        const {user, expires} = payload as {user: Omit<Table<'users'>, 'password'>, expires: number};
        if (expires < Date.now()) return { error: "Token expired" };
        return { user };
    } catch (error) {
        return { error: error.message };
    }
  }

  static async register(email: string, password: string) {
    const parsedEmail = z.string().email().safeParse(email)
    if (!parsedEmail.success) return { error: "Invalid email", data: undefined };
    console.log('ok');
    try {
      const r = await
    fetch('https://hfumkvdxfzkgmbkrfkoe.supabase.co/rest/v1/usuarios', {
      method: 'POST',
      headers: {
        apikey: Deno.env.get("SERVICE_KEY") as string,
        "Authorization": `Bearer ${Deno.env.get("SERVICE_KEY") as string}`,
        'Content-Type': 'application/json',
        "Prefer": "return=representation"
      },
      body: JSON.stringify({
        email,
        password: await hash(password),
        username: await getDisponibility(email.split('@')[0]),
      })
    }).then(async res => ({data:(await res.json())[0], error: undefined})).catch(e => {
      console.log('ee', e);
      
      return ({error: e.message, data: undefined})
    });
    return r
    } catch (error) {
      console.log('catch', error);
      throw new Error(error.message);
    }
  }
}

async function getDisponibility(username: string) {
  const users = await supabase.from('usuarios').select('username').like('username', `${username}`)
  if (users.error) throw new Error(users.error.message);
  if (users.data.length == 0) return username;
  const userlist = users.data.map((u: {username:string}) => u.username);
  const next = (num: number): string => {
    if (userlist.includes(`${username}${num}`)) return next(num+1);
    return `${username}${num}`;
  };
  return next(1);
}