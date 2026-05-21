import type { Reading, QuestionResponse, QuizSubmissionRequest, QuizAttempt } from "./types";
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

export async function fetchReadings(): Promise<Reading[]> {
    return request<Reading[]>("/api/student/readings");
}

export async function fetchReadingById(id: string): Promise<Reading> {
    return request<Reading>(`/api/student/readings/${id}`);
}

export async function fetchReadingQuestions(id: string): Promise<QuestionResponse[]> {
    return request<QuestionResponse[]>(`/api/student/readings/${id}/questions`);
}

export async function submitQuiz(id: string, payload: QuizSubmissionRequest): Promise<QuizAttempt> {
    return request<QuizAttempt>(`/api/student/readings/${id}/submit`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function completeReading(id: string): Promise<void> {
    return request<void>(`/api/student/readings/${id}/complete`, {
        method: "POST",
    });
}

export async function adminGetAll(): Promise<Reading[]> {
    return request<Reading[]>("/api/admin/readings");
}

export async function adminCreateReading(payload: { title: string; content: string; author: string }): Promise<Reading> {
    return request<Reading>("/api/admin/readings", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function adminUpdateReading(id: string, payload: { title: string; content: string; author: string }): Promise<Reading> {
    return request<Reading>(`/api/admin/readings/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export async function adminDeleteReading(id: string): Promise<void> {
    return request<void>(`/api/admin/readings/${id}`, {
        method: "DELETE",
    });
}

export async function adminHideReading(id: string): Promise<void> {
    return request<void>(`/api/admin/readings/${id}/hide`, {
        method: "PATCH",
    });
}

export async function adminUnhideReading(id: string): Promise<void> {
    return request<void>(`/api/admin/readings/${id}/unhide`, {
        method: "PATCH",
    });
}

export async function adminAddQuestion(
    readingId: string,
    payload: { questionText: string; options: string[]; correctAnswer: string }
): Promise<QuestionResponse> {
    return request<QuestionResponse>(`/api/admin/readings/${readingId}/questions`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function adminUpdateQuestion(
    questionId: string,
    payload: { questionText: string; options: string[]; correctAnswer: string }
): Promise<QuestionResponse> {
    return request<QuestionResponse>(`/api/admin/questions/${questionId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export async function adminDeleteQuestion(questionId: string): Promise<void> {
    return request<void>(`/api/admin/questions/${questionId}`, {
        method: "DELETE",
    });
}


