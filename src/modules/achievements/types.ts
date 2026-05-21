export interface Achievement {
    id: string;
    name: string;
    description: string;
    type: string;
    milestone: number;
}

export interface DailyMission {
    id: string;
    name: string;
    description: string;
    targetType: string;
    milestone: number;
}

export interface UserAchievementProgress {
    id: string;
    userId: string;
    achievementId: string;
    currentProgress: number;
    completed: boolean;
    isCompleted?: boolean; // fallback
    completedAt: string | null;
    displayedOnProfile?: boolean;
}

export interface UserDailyMissionProgress {
    id: string;
    userId: string;
    missionId: string;
    date?: string; // ISO LocalDate "2026-05-20"
    currentProgress: number;
    completed: boolean;
    isCompleted?: boolean; // fallback
    completedAt: string | null;
}

