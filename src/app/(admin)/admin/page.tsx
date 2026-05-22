"use client";

import { useEffect, useState } from "react";
import { BookOpen, Trophy, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { fetchReadings, fetchAchievements, fetchDailyMissions } from "@/src/modules/admin/api";

export default function AdminDashboardPage() {
    const [readingsCount, setReadingsCount] = useState<number | null>(null);
    const [achievementsCount, setAchievementsCount] = useState<number | null>(null);
    const [missionsCount, setMissionsCount] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        Promise.allSettled([
            fetchReadings(),
            fetchAchievements(),
            fetchDailyMissions(),
        ]).then(([readingsResult, achievementsResult, missionsResult]) => {
            if (readingsResult.status === "fulfilled") setReadingsCount(readingsResult.value.length);
            if (achievementsResult.status === "fulfilled") setAchievementsCount(achievementsResult.value.length);
            if (missionsResult.status === "fulfilled") setMissionsCount(missionsResult.value.length);

            const errors = [readingsResult, achievementsResult, missionsResult]
                .filter((r): r is PromiseRejectedResult => r.status === "rejected")
                .map((r) => r.reason instanceof Error ? r.reason.message : "Unknown error");

            if (errors.length > 0) setError(errors.join(", "));
        });
    }, []);

    const stats = [
        { label: "Total Readings", value: readingsCount, icon: BookOpen, color: "var(--primary)" },
        { label: "Total Achievements", value: achievementsCount, icon: Trophy, color: "var(--accent)" },
        { label: "Daily Missions", value: missionsCount, icon: Target, color: "var(--info)" },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Dashboard</h2>
                <p className="text-muted-foreground">Overview of your platform content</p>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="grid gap-4 md:grid-cols-3">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.label}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                                <Icon className="size-4" style={{ color: stat.color }} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {stat.value !== null ? stat.value : "..."}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
