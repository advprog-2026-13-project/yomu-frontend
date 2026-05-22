export interface QuestionResponse {
    questionId: string;
    questionText: string;
    options: string[];
    correctAnswer?: string; // Optional: only returned to admin
}

export interface Reading {
    readingId: string;
    title: string;
    content: string;
    author?: string; // fallback
    authorId?: string | null;
    category?: string | null;
    completed?: boolean; // transient
    hidden?: boolean; // admin visibility toggle
    questions?: QuestionResponse[];
}

export interface StudentAnswer {
    questionId: string;
    selectedAnswer: string;
}

export interface QuizSubmissionRequest {
    answers: StudentAnswer[];
}

export interface QuizAttempt {
    quizAttemptId: string;
    studentId: string;
    readingId: string;
    score: number;
    completedAt: string;
}

