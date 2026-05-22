export interface User {
    id?: string;
    username: string;
    displayName: string;
    email?: string;
    phoneNumber?: string;
    role: string;
}

export interface LoginInput {
    identifier: string;
    password: string;
}

export interface RegisterInput {
    username: string;
    displayName: string;
    email?: string | null;
    phoneNumber?: string | null;
    password: string;
}

export interface AuthResponse {
    token?: string;
    accessToken?: string;
    jwt?: string;
    message?: string;
}

export interface UpdateUserInput {
    username: string;
    displayName: string;
    email: string;
    phoneNumber: string;
}
