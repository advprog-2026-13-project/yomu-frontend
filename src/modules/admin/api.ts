import { getToken } from "../auth/api";
import { BACKEND_URL } from "./constants";
import type {
    Reading,
    CreateReadingInput,
    UpdateReadingInput,
    Question,
    CreateQuestionInput,
    UpdateQuestionInput,
    Achievement,
    CreateAchievementInput,
    UpdateAchievementInput,
    DailyMission,
    CreateDailyMissionInput,
    UpdateDailyMissionInput,
    AdminUser,
} from "./types";

function authHeaders(): Record<string, string> {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
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

function api(path: string): string {
    return `${BACKEND_URL}${path}`;
}

// Readings
export async function fetchReadings(): Promise<Reading[]> {
    return request<Reading[]>(api("/api/admin/readings"), { headers: authHeaders() });
}

export async function createReading(input: CreateReadingInput): Promise<Reading> {
    return request<Reading>(api("/api/admin/readings"), {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(input),
    });
}

export async function updateReading(id: string, input: UpdateReadingInput): Promise<Reading> {
    return request<Reading>(api(`/api/admin/readings/${id}`), {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(input),
    });
}

export async function deleteReading(id: string): Promise<void> {
    return request<void>(api(`/api/admin/readings/${id}`), {
        method: "DELETE",
        headers: authHeaders(),
    });
}

// Questions
export async function fetchQuestions(readingId: string): Promise<Question[]> {
    return request<Question[]>(api(`/api/admin/readings/${readingId}/questions`), { headers: authHeaders() });
}

export async function createQuestion(readingId: string, input: CreateQuestionInput): Promise<Question> {
    return request<Question>(api(`/api/admin/readings/${readingId}/questions`), {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(input),
    });
}

export async function updateQuestion(id: string, input: UpdateQuestionInput): Promise<Question> {
    return request<Question>(api(`/api/admin/questions/${id}`), {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(input),
    });
}

export async function deleteQuestion(id: string): Promise<void> {
    return request<void>(api(`/api/admin/questions/${id}`), {
        method: "DELETE",
        headers: authHeaders(),
    });
}

// Achievements
export async function fetchAchievements(): Promise<Achievement[]> {
    return request<Achievement[]>(api("/api/achievements"), { headers: authHeaders() });
}

export async function createAchievement(input: CreateAchievementInput): Promise<Achievement> {
    return request<Achievement>(api("/api/admin/achievements"), {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(input),
    });
}

export async function updateAchievement(id: string, input: UpdateAchievementInput): Promise<Achievement> {
    return request<Achievement>(api(`/api/admin/achievements/${id}`), {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(input),
    });
}

export async function deleteAchievement(id: string): Promise<void> {
    return request<void>(api(`/api/admin/achievements/${id}`), {
        method: "DELETE",
        headers: authHeaders(),
    });
}

// Daily Missions
export async function fetchDailyMissions(): Promise<DailyMission[]> {
    return request<DailyMission[]>(api("/api/achievements/daily-missions"), { headers: authHeaders() });
}

export async function createDailyMission(input: CreateDailyMissionInput): Promise<DailyMission> {
    return request<DailyMission>(api("/api/admin/achievements/daily-missions"), {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(input),
    });
}

export async function updateDailyMission(id: string, input: UpdateDailyMissionInput): Promise<DailyMission> {
    return request<DailyMission>(api(`/api/admin/achievements/daily-missions/${id}`), {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(input),
    });
}

export async function deleteDailyMission(id: string): Promise<void> {
    return request<void>(api(`/api/admin/achievements/daily-missions/${id}`), {
        method: "DELETE",
        headers: authHeaders(),
    });
}

// Forum
export async function deleteForumComment(id: string): Promise<void> {
    return request<void>(api(`/api/admin/forums/comments/${id}`), {
        method: "DELETE",
        headers: authHeaders(),
    });
}

// Users
export async function fetchUsers(): Promise<AdminUser[]> {
    return request<AdminUser[]>(api("/api/admin/users"), { headers: authHeaders() });
}

export async function promoteUser(id: string): Promise<void> {
    return request<void>(api(`/api/admin/users/${id}/promote`), {
        method: "PUT",
        headers: authHeaders(),
    });
}

export async function demoteUser(id: string): Promise<void> {
    return request<void>(api(`/api/admin/users/${id}/demote`), {
        method: "PUT",
        headers: authHeaders(),
    });
}
