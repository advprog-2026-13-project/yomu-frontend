import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const body = await req.json();
    const backend = process.env.BACKEND_URL ?? "http://localhost:8080";

    const res = await fetch(`${backend}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    const text = await res.text();
    console.log("LOGIN -> backend status:", res.status);
    console.log("LOGIN -> backend body:", text);

    let data: any = {};
    try {
        data = JSON.parse(text);
    } catch {
        data = { raw: text };
    }
    // hi
    return NextResponse.json(data, { status: res.status });
}