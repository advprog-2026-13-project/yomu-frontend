import { NextResponse } from "next/server";

const backend = process.env.BACKEND_URL ?? "http://localhost:8080";

export async function GET(req: Request) {
    const auth = req.headers.get("authorization");
    if (!auth) {
        return NextResponse.json({ message: "Missing Authorization header" }, { status: 401 });
    }

    const res = await fetch(`${backend}/api/auth/me`, {
        method: "GET",
        headers: { Authorization: auth },
        cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
}

export async function PATCH(req: Request) {
    const auth = req.headers.get("authorization");
    if (!auth) {
        return NextResponse.json({ message: "Missing Authorization header" }, { status: 401 });
    }

    const body = await req.json();

    const res = await fetch(`${backend}/api/auth/me`, {
        method: "PATCH",
        headers: {
            "Authorization": auth,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
}

export async function DELETE(req: Request) {
    const auth = req.headers.get("authorization");
    if (!auth) {
        return NextResponse.json({ message: "Missing Authorization header" }, { status: 401 });
    }

    const res = await fetch(`${backend}/api/auth/me`, {
        method: "DELETE",
        headers: { Authorization: auth },
    });

    if (res.status === 204) {
        return new NextResponse(null, { status: 204 });
    }

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
}