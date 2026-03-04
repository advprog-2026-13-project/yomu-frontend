import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const body = await req.json();
    const backend = process.env.BACKEND_URL ?? "http://localhost:8080";

    const res = await fetch(`${backend}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
}