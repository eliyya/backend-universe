import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";
// import { join } from "https://deno.land/std@0.193.0/path/mod.ts";
import { Router } from "https://deno.land/x/oak@v12.6.0/mod.ts";
import { create } from "https://deno.land/x/djwt@v2.9.1/mod.ts";
import { hash } from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const key = await crypto.subtle.generateKey(
  { name: "HMAC", hash: "SHA-512" },
  true,
  ["sign", "verify"],
);

// Create a single supabase client for interacting with your database
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") as string,
  Deno.env.get("SUPABASE_PUBLIC_KEY") as string,
);

// const codes = new Map<string, string>();
const router = new Router();

router
  .post("/auth/authorize", async (ctx) => {
    ctx.response.headers.set("Access-Control-Allow-Origin", "*");
    // revisamos si existe un body
    if (!ctx.request.hasBody) {
      ctx.response.status = 400;
      ctx.response.body = { message: "Invalid request" };
      return;
    }
    const { user, password } = await ctx.request.body({ type: "json" }).value;
    // buscamos el usuario en la base de datos
    const { data } = await supabase.from("users")
      .select()
      .eq("email", user);
    // revisamos si el usuario existe
    if (!data || data.length === 0) {
      ctx.response.status = 400;
      ctx.response.body = { message: "Invalid user or password" };
      return;
    }
    // encriptar contrasenia
    const ep = await hash(password);
    if (data[0].password !== ep) {
      ctx.response.status = 400;
      ctx.response.body = { message: "Invalid user or password" };
      return;
    }
    // generar token
    const expires = Date.now() + 60 * 60 * 24;
    const jwt = await create(
      { alg: "HS512", typ: "JWT" },
      { user, expires, id: data[0].id },
      key,
    );
    // retornar token
    ctx.response.body = {
      token: jwt,
      expires,
    };
  })
  .options("/auth/authorize", (ctx) => {
    ctx.response.headers.set("Access-Control-Allow-Origin", "*");
    ctx.response.headers.set("Access-Control-Allow-Methods", "POST");
    ctx.response.status = 200;
  })

export default router;
