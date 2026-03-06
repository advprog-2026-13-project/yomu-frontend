import {
    Reading,
    QuestionResponse,
    QuizSubmissionRequest,
    QuizAttemptResponse
} from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

export const api = {
    getAdminReadings: async (): Promise<Reading[]> => {
        const res = await fetch(`${BASE_URL}/admin/readings`);
        if (!res.ok) {
            throw new Error(`Gagal mengambil data. Status HTTP: ${res.status}`);
        }
        return res.json();
    },

    getStudentReadings: (studentId: string): Promise<Reading[]> =>
        fetch(`${BASE_URL}/student/readings?studentId=${studentId}`).then(res => res.json()),

    createReading: (payload: Omit<Reading, 'readingId'>): Promise<Reading> =>
        fetch(`${BASE_URL}/admin/readings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        }).then(res => res.json()),

    getReadingDetail: (readingId: string, studentId: string): Promise<Reading> =>
        fetch(`${BASE_URL}/student/readings/${readingId}?studentId=${studentId}`).then(res => res.json()),

    updateReading: (readingId: string, payload: Omit<Reading, 'readingId'>): Promise<Reading> =>
        fetch(`${BASE_URL}/admin/readings/${readingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        }).then(res => res.json()),

    deleteReading: (readingId: string): Promise<void> =>
        fetch(`${BASE_URL}/admin/readings/${readingId}`, {
            method: 'DELETE',
        }).then(res => {
            if (!res.ok) throw new Error("Gagal menghapus");
        }),

    getQuestions: (readingId: string, studentId: string): Promise<QuestionResponse[]> =>
        fetch(`${BASE_URL}/student/readings/${readingId}/questions?studentId=${studentId}`).then(res => res.json()),

    submitQuiz: (readingId: string, payload: QuizSubmissionRequest): Promise<QuizAttemptResponse> =>
        fetch(`${BASE_URL}/student/readings/${readingId}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        }).then(res => res.json()),
};