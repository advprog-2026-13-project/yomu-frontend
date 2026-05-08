export interface Question {
    questionId: string;
    questionText: string;
    options: string[];
    correctAnswer: string;
}

export interface QuestionPayload {
    questionText: string;
    options: string[];
    correctAnswer: string;
}