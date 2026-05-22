"use client";

import { useState, useEffect } from "react";
import { Trophy, Target, Award, Star, ArrowRight, Calendar, Loader2 } from "lucide-react";
import { useMasterAchievements, useUserAchievements } from "@/src/modules/achievements/hooks";
import { useAuth } from "@/src/modules/auth";
import { clsx } from "clsx";

export default function AchievementsPage() {
    const [mounted, setMounted] = useState(false);
    const { user } = useAuth();
    
    const { 
        achievements, 
        dailyMissions, 
        loading: masterLoading, 
        error: masterError 
    } = useMasterAchievements();
    
    const { 
        progress, 
        dailyProgress, 
        loading: progressLoading, 
        error: progressError 
    } = useUserAchievements();

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="yomu-page-container flex justify-center items-center py-20">
                <div className="flex flex-col items-center space-y-3">
                    <div className="w-10 h-10 border-4 border-yomu-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-yomu-text-secondary font-medium">Memuat pencapaian...</p>
                </div>
            </div>
        );
    }

    const loading = masterLoading || progressLoading;
    const error = masterError || progressError;
    const isAdmin = user?.role === "ADMIN";

    // Resilient Merge Logic for Daily Missions
    const mergedMissions = dailyMissions.map(mission => {
        const prog = dailyProgress.find(p => p.missionId === mission.id);
        const isCompleted = prog?.completed ?? prog?.isCompleted ?? false;
        return {
            ...mission,
            currentProgress: prog?.currentProgress || 0,
            completed: isCompleted,
        };
    });

    // Resilient Merge Logic for Achievements
    const mergedAchievements = achievements.map(ach => {
        const prog = progress.find(p => p.achievementId === ach.id);
        const isCompleted = prog?.completed ?? prog?.isCompleted ?? false;
        return {
            ...ach,
            currentProgress: prog?.currentProgress || 0,
            completed: isCompleted,
            completedAt: prog?.completedAt || null,
        };
    });

    // Sort achievements so completed ones are styled and listed in intuitive ways, or just map them
    const completedCount = mergedAchievements.filter(a => a.completed).length;

    return (
        <div className="yomu-page-container flex flex-col space-y-12 max-w-7xl mx-auto px-4 py-8">
            {/* Header Banner */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-yomu-accent-dark to-indigo-950 p-8 md:p-12 text-white shadow-xl shadow-yomu-accent/10">
                <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 transform -translate-x-12 translate-y-12 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-4 max-w-xl">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-white/90 uppercase tracking-wider backdrop-blur-md">
                            <Trophy size={12} className="text-yomu-accent" />
                            Ruang Penghargaan
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold font-serif leading-tight">Lencana & Target Anda</h1>
                        <p className="text-white/80 text-sm md:text-base font-medium">
                            Selesaikan misi harian untuk menjaga konsistensi belajar, dan raih penghargaan jangka panjang yang membanggakan untuk profil akademis Anda!
                        </p>
                    </div>

                    <div className="flex-shrink-0 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-6 px-10 text-center flex flex-col justify-center items-center">
                        <Award size={48} className="text-yomu-accent mb-2 animate-pulse" />
                        <span className="text-xs font-bold text-white/80 uppercase">Lencana Diraih</span>
                        <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-4xl font-extrabold text-white">{completedCount}</span>
                            <span className="text-sm font-semibold text-white/60"> / {achievements.length}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Admin Management Callout */}
            {isAdmin && (
                <div className="bg-yomu-accent-light/20 border border-yomu-accent/20 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h2 className="text-base font-bold text-yomu-accent-dark flex items-center gap-2">
                            🏆 Panel Pencapaian Admin Aktif
                        </h2>
                        <p className="text-xs text-yomu-text-secondary">
                            Sebagai administrator, Anda memiliki akses penuh untuk merancang target pencapaian baru, membuat misi harian, menghapus item, serta mereset progres global.
                        </p>
                    </div>
                    <a
                        href="/admin/achievements"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-yomu-accent text-white rounded-xl text-sm font-semibold hover:bg-yomu-accent-dark transition-all transform hover:-translate-y-0.5 shadow-md shadow-yomu-accent/10 cursor-pointer self-start md:self-auto"
                    >
                        Buka Manajemen Pencapaian
                        <ArrowRight size={16} />
                    </a>
                </div>
            )}

            {loading ? (
                <div className="flex flex-col justify-center items-center py-20 space-y-4">
                    <Loader2 className="animate-spin text-yomu-accent" size={40} />
                    <p className="text-yomu-text-secondary animate-pulse">Menghubungkan ke server...</p>
                </div>
            ) : error ? (
                <div className="yomu-card p-4 border-yomu-destructive/50 bg-yomu-destructive/10 text-yomu-destructive">
                    <p>Gagal memuat data pencapaian: {error.message}</p>
                </div>
            ) : (
                <>
                    {/* DAILY MISSIONS */}
                    <section className="space-y-6">
                        <h2 className="yomu-heading-2 flex items-center text-yomu-accent-dark">
                            <Target className="mr-2.5 text-yomu-accent" size={24} />
                            Misi Belajar Hari Ini
                        </h2>
                        
                        {mergedMissions.length === 0 ? (
                            <div className="yomu-card p-12 text-center border-dashed border-2 flex flex-col items-center justify-center space-y-2 bg-gray-50/50">
                                <Target size={36} className="text-yomu-text-secondary/75" />
                                <p className="text-yomu-text-secondary font-medium">Tidak ada misi harian yang aktif untuk hari ini.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {mergedMissions.map((mission) => {
                                    const percent = Math.min(100, Math.round((mission.currentProgress / mission.milestone) * 100));
                                    
                                    return (
                                        <div 
                                            key={mission.id} 
                                            className={clsx(
                                                "yomu-card p-6 flex flex-col h-full border transition-all duration-300 relative overflow-hidden bg-yomu-surface rounded-2xl shadow-sm",
                                                mission.completed 
                                                ? "border-green-200 bg-gradient-to-br from-white to-green-50/10 shadow-green-100/50" 
                                                : "border-yomu-border hover:border-yomu-accent/30 hover:shadow-md"
                                            )}
                                        >
                                            {mission.completed && (
                                                <div className="absolute top-0 right-0 bg-green-500 text-white text-[9px] font-extrabold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                                                    Selesai
                                                </div>
                                            )}

                                            <div className="flex justify-between items-start mb-4">
                                                <div className={clsx(
                                                    "w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner",
                                                    mission.completed ? "bg-green-100 text-green-600" : "bg-yomu-accent-light text-yomu-accent"
                                                )}>
                                                    <Star size={20} />
                                                </div>
                                                <span className="text-[9px] font-bold bg-gray-100 text-yomu-text-secondary px-2 py-0.5 rounded uppercase">
                                                    {mission.targetType.replace('_', ' ')}
                                                </span>
                                            </div>

                                            <h3 className="text-base font-bold text-yomu-foreground mb-1 leading-snug font-heading">{mission.name}</h3>
                                            <p className="text-xs text-yomu-text-secondary mb-6 leading-relaxed flex-grow">{mission.description}</p>
                                            
                                            <div className="mt-auto space-y-2.5">
                                                <div className="flex justify-between text-xs font-semibold">
                                                    <span className={mission.completed ? "text-green-600" : "text-yomu-text-secondary"}>
                                                        Progres Misi
                                                    </span>
                                                    <span className="text-yomu-foreground">{mission.currentProgress} <span className="text-yomu-text-secondary font-normal">/ {mission.milestone}</span></span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden shadow-inner">
                                                    <div 
                                                        className={clsx(
                                                            "h-2.5 rounded-full transition-all duration-700 ease-out", 
                                                            mission.completed ? "bg-green-500" : "bg-gradient-to-r from-yomu-accent to-indigo-500"
                                                        )} 
                                                        style={{ width: `${percent}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    {/* LONG-TERM ACHIEVEMENTS */}
                    <section className="space-y-6 pt-4">
                        <h2 className="yomu-heading-2 flex items-center text-yomu-primary-dark">
                            <Trophy className="mr-2.5 text-yomu-primary" size={24} />
                            Penghargaan Bergengsi (Achievements)
                        </h2>
                        
                        {mergedAchievements.length === 0 ? (
                            <div className="yomu-card p-12 text-center border-dashed border-2 flex flex-col items-center justify-center space-y-2 bg-gray-50/50">
                                <Award size={36} className="text-yomu-text-secondary/75" />
                                <p className="text-yomu-text-secondary font-medium">Belum ada lencana pencapaian yang tersedia.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {mergedAchievements.map((ach) => {
                                    const percent = Math.min(100, Math.round((ach.currentProgress / ach.milestone) * 100));
                                    
                                    return (
                                        <div 
                                            key={ach.id} 
                                            className={clsx(
                                                "yomu-card p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 border transition-all duration-300 bg-yomu-surface rounded-2xl shadow-sm", 
                                                ach.completed 
                                                ? "border-yomu-primary/30 bg-gradient-to-br from-white to-yomu-primary-light/5 shadow-yomu-primary-light/40" 
                                                : "border-yomu-border opacity-85 hover:opacity-100 hover:border-yomu-primary/20 hover:shadow-md"
                                            )}
                                        >
                                            <div className={clsx(
                                                "w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md transition-all duration-300", 
                                                ach.completed 
                                                ? "bg-gradient-to-br from-yomu-primary to-yomu-primary-dark text-white scale-105" 
                                                : "bg-gray-100 text-yomu-text-secondary border border-gray-200"
                                            )}>
                                                <Award size={34} />
                                            </div>
                                            <div className="flex-grow w-full space-y-3">
                                                <div className="space-y-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h3 className="text-base font-bold text-yomu-foreground font-heading leading-snug">{ach.name}</h3>
                                                        <span className={clsx(
                                                            "text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider",
                                                            ach.completed ? "bg-yomu-primary-light text-yomu-primary" : "bg-gray-100 text-yomu-text-secondary"
                                                        )}>
                                                            {ach.type.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-yomu-text-secondary leading-relaxed">{ach.description}</p>
                                                </div>
                                                
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                                                        <span className={ach.completed ? "text-yomu-primary" : "text-yomu-text-secondary"}>
                                                            {ach.completed ? "✓ Lencana Terbuka" : "Sedang berjalan"}
                                                        </span>
                                                        <span className="text-yomu-foreground">{ach.currentProgress} <span className="text-yomu-text-secondary font-normal">/ {ach.milestone}</span></span>
                                                    </div>
                                                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden shadow-inner">
                                                        <div 
                                                            className={clsx(
                                                                "h-2 rounded-full transition-all duration-700 ease-out", 
                                                                ach.completed ? "bg-yomu-primary" : "bg-yomu-primary/45"
                                                            )} 
                                                            style={{ width: `${percent}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                {ach.completed && ach.completedAt && (
                                                    <div className="text-[10px] font-semibold text-green-700 bg-green-50 border border-green-150 rounded-lg p-1.5 px-2.5 w-fit flex items-center gap-1">
                                                        <Calendar size={12} />
                                                        Diterima pada: {new Date(ach.completedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </>
            )}
        </div>
    );
}
