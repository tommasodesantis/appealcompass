export interface Env {
  ASSETS?: Fetcher;
  SOCRATA_APP_TOKEN?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/health") {
      return Response.json({
        ok: true,
        service: "cookpropertytax",
      });
    }

    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response("cookpropertytax", {
      headers: { "content-type": "text/plain;charset=utf-8" },
    });
  },
} satisfies ExportedHandler<Env>;
