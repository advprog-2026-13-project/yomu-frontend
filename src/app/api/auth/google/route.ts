import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { token } = body;

        if (!token) {
            return NextResponse.json({ message: "Google token is required" }, { status: 400 });
        }

        const backend = process.env.BACKEND_URL ?? "http://localhost:8080";

        const res = await fetch(`${backend}/api/auth/google`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({ token }),
        });

        const data = await res.json().catch(() => ({}));

        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error("PROXY ERROR:", error);
        return NextResponse.json({ message: "Internal Server Error in Proxy" }, { status: 500 });
    }
}