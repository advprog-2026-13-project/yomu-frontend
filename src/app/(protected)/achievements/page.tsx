"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/src/modules/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Trophy, Target, Award, Lock, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

// Mock Data structure mirroring the backend UserAchievementProgress
interface UserAchievementProgress {
    achievementId: string;
    name: string;
    description: string;
    pointsReward: number;
    isCompleted: boolean;
    progressCount: number;
    targetCount: number;
    iconUrl?: string;
}

interface DailyMissionProgress {
    missionId: string;
    title: string;
    pointsReward: number;
    isCompleted: boolean;
    currentProgress: number;
    targetProgress: number;
}

export default function AchievementsPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    
    const [achievements, setAchievements] = useState<UserAchievementProgress[]>([]);
    const [dailyMissions, setDailyMissions] = useState<DailyMissionProgress[]>([]);

    useEffect(() => {
        setTimeout(() => {
            setDailyMissions([
                { missionId: "m1", title: "Baca 2 Artikel", pointsReward: 50, isCompleted: true, currentProgress: 2, targetProgress: 2 },
                { missionId: "m2", title: "Selesaikan 1 Kuis Sempurna", pointsReward: 100, isCompleted: false, currentProgress: 0, targetProgress: 1 },
                { missionId: "m3", title: "Login 3 Hari Berturut-turut", pointsReward: 30, isCompleted: false, currentProgress: 2, targetProgress: 3 },
            ]);
            
            setAchievements([
                { achievementId: "a1", name: "Kutu Buku Pemula", description: "Membaca 5 artikel pertama.", pointsReward: 200, isCompleted: true, progressCount: 5, targetCount: 5 },
                { achievementId: "a2", name: "Mata Elang", description: "Menjawab 10 kuis dengan benar tanpa salah.", pointsReward: 500, isCompleted: false, progressCount: 7, targetCount: 10 },
                { achievementId: "a3", name: "Raja Liga Mingguan", description: "Mencapai peringkat 1 di liga minggu ini.", pointsReward: 1000, isCompleted: false, progressCount: 0, targetCount: 1 },
                { achievementId: "a4", name: "Penjelajah Topik", description: "Membaca artikel dari 5 kategori berbeda.", pointsReward: 300, isCompleted: true, progressCount: 5, targetCount: 5 },
            ]);
            setLoading(false);
        }, 1000);
    }, [user?.id]);

    if (loading) {
        return <div className="flex min-h-[60vh] items-center justify-center p-4">Loading achievements...</div>;
    }

    return (
        <div className="yomu-page-container">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-2">
                    <h1 className="yomu-heading-1">
                        <Trophy className="h-8 w-8 text-amber-500" />
                        Pencapaian & Misi
                    </h1>
                    <p className="yomu-text-muted">Selesaikan misi untuk mendapatkan poin dan naikkan rank ligamu!</p>
                </div>
                <div className="yomu-card p-4 flex items-center gap-4 border-0">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                        <Star className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-600">Total Poin</p>
                        <p className="yomu-card-value">1,250</p>
                    </div>
                </div>
            </div>

            {/* Misi Harian */}
            <div className="space-y-4">
                <h2 className="yomu-heading-2">
                    <Target className="h-6 w-6 text-emerald-600" />
                    Misi Harian
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {dailyMissions.map((mission) => (
                        <Card key={mission.missionId} className={`yomu-card border-blue-100 transition-all ${mission.isCompleted ? 'bg-emerald-50 border-emerald-200' : 'bg-white'}`}>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-md font-medium text-blue-950">{mission.title}</CardTitle>
                                    {mission.isCompleted && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
                                </div>
                                <CardDescription className="text-amber-600 font-medium">+{mission.pointsReward} Pts</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-slate-600">
                                        <span>Progress</span>
                                        <span>{mission.currentProgress} / {mission.targetProgress}</span>
                                    </div>
                                    <Progress value={(mission.currentProgress / mission.targetProgress) * 100} className="h-2" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Badges / Pencapaian Utama */}
            <div className="space-y-4 pt-4">
                <h2 className="yomu-heading-2">
                    <Award className="h-6 w-6 text-blue-700" />
                    Badge Koleksi
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {achievements.map((ach) => (
                        <div key={ach.achievementId} className={`flex items-center gap-4 p-4 rounded-2xl border ${ach.isCompleted ? 'bg-white border-blue-200 shadow-[0_4px_20px_rgb(0,0,0,0.03)]' : 'bg-slate-50 border-slate-200 opacity-70'}`}>
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 ${ach.isCompleted ? 'bg-blue-100' : 'bg-slate-200'}`}>
                                {ach.isCompleted ? (
                                    <Trophy className="h-8 w-8 text-blue-700" />
                                ) : (
                                    <Lock className="h-6 w-6 text-slate-400" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-bold text-blue-950 truncate">{ach.name}</h3>
                                    <span className="text-xs font-medium text-amber-600 shrink-0">+{ach.pointsReward} Pts</span>
                                </div>
                                <p className="text-sm text-slate-600 mb-3">{ach.description}</p>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs text-slate-500 font-medium">
                                        <span>{ach.progressCount} / {ach.targetCount}</span>
                                        <span>{Math.round((ach.progressCount / ach.targetCount) * 100)}%</span>
                                    </div>
                                    <Progress value={(ach.progressCount / ach.targetCount) * 100} className="h-1.5" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
