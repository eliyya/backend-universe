import { join, toFileUrl } from "https://deno.land/std@0.193.0/path/mod.ts";
import { type Application } from "https://deno.land/x/oak@v12.6.0/mod.ts";

export async function loadRouters(
  path: string,
  app: Application,
): Promise<void> {
  for await (const file of Deno.readDir(path)) {
    if (
      !(file.isFile && (file.name.endsWith(".ts") || file.name.endsWith(".js")))
    ) continue;
    const { default: router } = await import(`${toFileUrl(join(path, file.name))}`);
    app.use(router.routes());
    app.use(router.allowedMethods());
  }
}
