import { z } from "https://deno.land/x/zod@v3.21.4/mod.ts";
import { compare, hash } from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
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
    if (!parsedEmail.success) return { error: "Invalid email" };
    const req = await supabase.from('users').select().eq('email', email)
    console.log(req)
    if (req.status !== 200) return { error: "Invalid user or password" };
    if (req.data?.length) return { error: "User already exists" };
    console.log('ok');
    //     const r = await fetch(`${Deno.env.get("SUPABASE_URL")}/rest/v1/users`, {
    //   method: "POST",
    //   headers: {
    //     apikey: Deno.env.get("SUPABASE_PUBLIC_KEY") as string,
    //    "Authorization": `Bearer ${Deno.env.get("SUPABASE_PUBLIC_KEY")}`,
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     email: parsedEmail.data,
    //     password: await hash(`${password}`),
    //     username: email.split("@")[0],
    //   }),
    // }).then((res) => res.json())
    const r = await supabase.from('users').insert({
      email: parsedEmail.data,
      password: await hash(`${password}`),
      username: email.split("@")[0],
    })
    console.log('r', r);
    // const { data, error } = await supabase.from("users").eq("email", email).select();
    // console.log('?', {error, data});
    
    // if (error) return { error };
    // const [u] = data;
    // const user = await User.schema.safeParse(u)
    // return { user };
  }
}
