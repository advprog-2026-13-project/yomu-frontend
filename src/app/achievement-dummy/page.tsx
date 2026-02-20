"use client";

import { useEffect, useState } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080";

export default function AchievementsDummyPage() {
    const [totalHits, setTotalHits] = useState<number>(0);
    const [loading, setLoading] = useState(false);

    async function loadTotal() {
        const res = await fetch(`${BASE_URL}/api/achievements/dummy-hit`, {
            cache: "no-store",
        });
        const data = await res.json();
        setTotalHits(data.totalHits ?? 0);
    }

    async function hitDummy() {
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/api/achievements/dummy-hit`, {
                method: "POST",
            });
            const data = await res.json();
            setTotalHits(data.totalHits ?? 0);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadTotal();
    }, []);

    return (
        <main style={{ padding: 24, fontFamily: "sans-serif" }}>
            <h1>Achievements Dummy Integration</h1>
            <p>
                Total hits from DB: <b>{totalHits}</b>
            </p>

            <button onClick={hitDummy} disabled={loading}>
                {loading ? "Sending..." : "Hit Backend (save to DB)"}
            </button>
        </main>
    );
}