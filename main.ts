import { serve } from "https://deno.land/std/http/server.ts";

const body = "Hello, Deno";
const s = serve({ port: 8080 });

for await (const req of s) {
  req.respond({ body });
}
