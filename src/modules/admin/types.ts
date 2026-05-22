export interface Reading {
    readingId: string;
    title: string;
    content: string;
    category: string;
    authorId: string;
}

export interface CreateReadingInput {
    title: string;
    content: string;
    author: string;
}

export interface UpdateReadingInput {
    title?: string;
    content?: string;
    author?: string;
}

export interface Question {
    id: string;
    questionText: string;
    options: string[];
    correctAnswer: string;
    readingId: string;
}

export interface CreateQuestionInput {
    questionText: string;
    options: string[];
    correctAnswer: string;
}

export interface UpdateQuestionInput {
    questionText?: string;
    options?: string[];
    correctAnswer?: string;
}

export interface Achievement {
    id: string;
    name: string;
    description?: string;
    achievementType: "READING_COMPLETED" | "QUIZ_COMPLETED";
    milestone: number;
}

export interface CreateAchievementInput {
    name: string;
    description?: string;
    type: "READING_COMPLETED" | "QUIZ_COMPLETED";
    milestone: number;
}

export interface UpdateAchievementInput {
    name?: string;
    description?: string;
    milestone?: number;
}

export interface DailyMission {
    id: string;
    name: string;
    description?: string;
    targetType: "READING_COMPLETED" | "QUIZ_COMPLETED";
    milestone: number;
}

export interface CreateDailyMissionInput {
    name: string;
    description?: string;
    targetType: "READING_COMPLETED" | "QUIZ_COMPLETED";
    milestone: number;
}

export interface UpdateDailyMissionInput {
    name?: string;
    description?: string;
    milestone?: number;
}

export interface AdminStats {
    readings: Reading[];
    achievements: Achievement[];
    dailyMissions: DailyMission[];
}

export interface AdminUser {
    id: string;
    username: string;
    displayName: string;
    role: string;
}
