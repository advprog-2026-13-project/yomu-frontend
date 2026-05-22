import type {
    Achievement,
    DailyMission,
    UserAchievementProgress,
    UserDailyMissionProgress
} from "./types";
import { getToken } from "../auth/api";

function authHeaders(): Record<string, string> {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
            ...options.headers,
        },
    });

    if (res.status === 204) return undefined as T;

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(data.message || `Request failed with status ${res.status}`);
    }

    return data;
}

export async function fetchAllAchievements(): Promise<Achievement[]> {
    return request<Achievement[]>("/api/achievements");
}

export async function fetchAllDailyMissions(): Promise<DailyMission[]> {
    return request<DailyMission[]>("/api/achievements/daily-missions");
}

export async function fetchUserProgress(userId: string): Promise<UserAchievementProgress[]> {
    return request<UserAchievementProgress[]>(`/api/achievements/users/${userId}/progress`);
}

export async function fetchUserDailyProgress(userId: string): Promise<UserDailyMissionProgress[]> {
    return request<UserDailyMissionProgress[]>(`/api/achievements/users/${userId}/daily-progress`);
}

export async function fetchCompletedAchievements(userId: string): Promise<UserAchievementProgress[]> {
    return request<UserAchievementProgress[]>(`/api/achievements/users/${userId}/completed`);
}

export async function adminCreateAchievement(payload: {
    name: string;
    description: string;
    type: string;
    milestone: number;
}): Promise<Achievement> {
    return request<Achievement>("/api/admin/achievements", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function adminCreateDailyMission(payload: {
    name: string;
    description: string;
    targetType: string;
    milestone: number;
}): Promise<DailyMission> {
    return request<DailyMission>("/api/admin/achievements/daily-missions", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function adminUpdateAchievement(id: string, payload: {
    name?: string;
    description?: string;
    milestone?: number;
}): Promise<Achievement> {
    return request<Achievement>(`/api/admin/achievements/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export async function adminUpdateDailyMission(id: string, payload: {
    name?: string;
    description?: string;
    milestone?: number;
}): Promise<DailyMission> {
    return request<DailyMission>(`/api/admin/achievements/daily-missions/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export async function adminDeleteAchievement(id: string): Promise<void> {
    return request<void>(`/api/admin/achievements/${id}`, {
        method: "DELETE",
    });
}

export async function adminDeleteDailyMission(id: string): Promise<void> {
    return request<void>(`/api/admin/achievements/daily-missions/${id}`, {
        method: "DELETE",
    });
}

export async function adminResetAll(): Promise<void> {
    return request<void>("/api/admin/achievements/daily-missions/reset", {
        method: "POST",
    });
}

export async function adminResetForUser(userId: string): Promise<void> {
    return request<void>(`/api/admin/achievements/daily-missions/reset/${userId}`, {
        method: "POST",
    });
}


