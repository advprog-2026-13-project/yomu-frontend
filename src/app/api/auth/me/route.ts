import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const backend = process.env.BACKEND_URL ?? "http://localhost:8080";

    const auth = req.headers.get("authorization"); // "Bearer ..."
    if (!auth) {
        return NextResponse.json({ message: "Missing Authorization header" }, { status: 401 });
    }

    const res = await fetch(`${backend}/api/me`, {
        method: "GET",
        headers: {
            Authorization: auth,
        },
        cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
}