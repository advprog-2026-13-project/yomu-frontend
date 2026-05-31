import { authHeaders, request } from "../api";
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

// Readings
export async function fetchReadings(): Promise<Reading[]> {
    return request<Reading[]>("/api/admin/readings", { headers: authHeaders() });
}

export async function createReading(input: CreateReadingInput): Promise<Reading> {
    return request<Reading>("/api/admin/readings", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(input),
    });
}

export async function updateReading(id: string, input: UpdateReadingInput): Promise<Reading> {
    return request<Reading>(`/api/admin/readings/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(input),
    });
}

export async function deleteReading(id: string): Promise<void> {
    return request<void>(`/api/admin/readings/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
    });
}

// Questions
export async function fetchQuestions(readingId: string): Promise<Question[]> {
    return request<Question[]>(`/api/admin/readings/${readingId}/questions`, { headers: authHeaders() });
}

export async function createQuestion(readingId: string, input: CreateQuestionInput): Promise<Question> {
    return request<Question>(`/api/admin/readings/${readingId}/questions`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(input),
    });
}

export async function updateQuestion(id: string, input: UpdateQuestionInput): Promise<Question> {
    return request<Question>(`/api/admin/questions/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(input),
    });
}

export async function deleteQuestion(id: string): Promise<void> {
    return request<void>(`/api/admin/questions/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
    });
}

// Achievements
export async function fetchAchievements(): Promise<Achievement[]> {
    return request<Achievement[]>("/api/achievements", { headers: authHeaders() });
}

export async function createAchievement(input: CreateAchievementInput): Promise<Achievement> {
    return request<Achievement>("/api/admin/achievements", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(input),
    });
}

export async function updateAchievement(id: string, input: UpdateAchievementInput): Promise<Achievement> {
    return request<Achievement>(`/api/admin/achievements/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(input),
    });
}

export async function deleteAchievement(id: string): Promise<void> {
    return request<void>(`/api/admin/achievements/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
    });
}

// Daily Missions
export async function fetchDailyMissions(): Promise<DailyMission[]> {
    return request<DailyMission[]>("/api/achievements/daily-missions", { headers: authHeaders() });
}

export async function createDailyMission(input: CreateDailyMissionInput): Promise<DailyMission> {
    return request<DailyMission>("/api/admin/achievements/daily-missions", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(input),
    });
}

export async function updateDailyMission(id: string, input: UpdateDailyMissionInput): Promise<DailyMission> {
    return request<DailyMission>(`/api/admin/achievements/daily-missions/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(input),
    });
}

export async function deleteDailyMission(id: string): Promise<void> {
    return request<void>(`/api/admin/achievements/daily-missions/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
    });
}

// Forum
export async function deleteForumComment(id: string): Promise<void> {
    return request<void>(`/api/admin/forums/comments/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
    });
}

// Users
export async function fetchUsers(): Promise<AdminUser[]> {
    return request<AdminUser[]>("/api/admin/users", { headers: authHeaders() });
}

export async function promoteUser(id: string): Promise<void> {
    return request<void>(`/api/admin/users/${id}/promote`, {
        method: "PUT",
        headers: authHeaders(),
    });
}

export async function demoteUser(id: string): Promise<void> {
    return request<void>(`/api/admin/users/${id}/demote`, {
        method: "PUT",
        headers: authHeaders(),
    });
}
