import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

async function handler(req: NextRequest) {
  const path = req.nextUrl.pathname.replace("/api/admin", "");
  const url = `${BACKEND_URL}/api/admin${path}${req.nextUrl.search}`;

  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    if (key !== "host" && key !== "content-length") headers[key] = value;
  });

  try {
    const res = await fetch(url, {
      method: req.method,
      headers,
      body: req.method !== "GET" && req.method !== "HEAD" ? await req.text() : undefined,
    });

    const data = await res.text();
    return new NextResponse(data, {
      status: res.status,
      headers: { "Content-Type": res.headers.get("Content-Type") || "application/json" },
    });
  } catch {
    return new NextResponse(JSON.stringify({ error: "Backend unreachable" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH };
