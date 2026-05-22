export interface Reading {
    readingId: string;
    title: string;
    content: string;
    category: string;
    authorId?: string;
}

export interface QuestionResponse {
    questionId: string;
    questionText: string;
    options: string[];
}

export interface StudentAnswer {
    questionId: string;
    selectedAnswer: string;
}

export interface QuizSubmissionRequest {
    studentId: string;
    answers: StudentAnswer[];
}

export interface QuizAttemptResponse {
    quizAttemptId: string;
    studentId: string;
    readingId: string;
    score: number;
    completedAt: string;
}