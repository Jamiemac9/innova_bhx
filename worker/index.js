// Cloudflare Worker entry: /api/* routes run here, everything else is served
// from the static build in ./dist (see wrangler.jsonc "assets").
import { checkout } from "./checkout.js";
import { session } from "./session.js";

const notAllowed = () =>
  new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { "content-type": "application/json" },
  });

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === "/api/checkout") return request.method === "POST" ? checkout(request, env) : notAllowed();
    if (pathname === "/api/session") return request.method === "GET" ? session(request, env) : notAllowed();
    if (pathname.startsWith("/api/")) return new Response("Not found", { status: 404 });
    return env.ASSETS.fetch(request);
  },
};
