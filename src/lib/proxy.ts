import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export function createProxy(apiPrefix: string) {
  async function handler(req: NextRequest) {
    const path = req.nextUrl.pathname.replace(apiPrefix, "");
    const url = `${BACKEND_URL}${apiPrefix}${path}${req.nextUrl.search}`;

    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      if (key !== "host" && key !== "content-length") headers[key] = value;
    });

    try {
      const body =
        req.method !== "GET" && req.method !== "HEAD"
          ? await req.text()
          : undefined;

      console.log("[BFF proxy]", req.method, url);
      const res = await fetch(url, {
        method: req.method,
        headers,
        body: body || undefined,
      });

      const data = await res.text();
      console.log("[BFF response]", res.status, url);
      return new NextResponse(res.status === 204 ? null : data, {
        status: res.status,
        headers: res.status !== 204
          ? { "Content-Type": res.headers.get("Content-Type") || "application/json" }
          : undefined,
      });
    } catch (e) {
      console.error("[BFF error]", url, e);
      return new NextResponse(JSON.stringify({ error: "Backend unreachable" }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  return { GET: handler, POST: handler, PUT: handler, DELETE: handler, PATCH: handler };
}
