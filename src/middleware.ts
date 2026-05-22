import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

const BFF_ROUTES = ["/api/auth/"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (BFF_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    const url = `${BACKEND_URL}${pathname}${req.nextUrl.search}`;

    const headers = new Headers();
    req.headers.forEach((value, key) => {
      if (key !== "host" && key !== "content-length") headers.set(key, value);
    });

    return fetch(url, {
      method: req.method,
      headers,
      body:
        req.method !== "GET" && req.method !== "HEAD"
          ? req.clone().body
          : undefined,
    })
      .then(async (res) => {
        const data = await res.text();
        return new NextResponse(data, {
          status: res.status,
          headers: {
            "Content-Type":
              res.headers.get("Content-Type") || "application/json",
          },
        });
      })
      .catch(() =>
        NextResponse.json({ error: "Backend unreachable" }, { status: 502 })
      );
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
