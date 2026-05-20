import type {
    AuthResponse,
    LoginInput,
    RegisterInput,
    UpdateUserInput,
    User,
} from "./types";

const TOKEN_KEY = "token";

export function getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
}

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

export async function login(input: LoginInput): Promise<AuthResponse> {
    return request<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(input),
    });
}

export async function register(input: RegisterInput): Promise<AuthResponse> {
    return request<AuthResponse>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(input),
    });
}

export async function loginWithGoogle(token: string): Promise<AuthResponse> {
    return request<AuthResponse>("/api/auth/google", {
        method: "POST",
        body: JSON.stringify({ token }),
    });
}

export async function fetchUser(): Promise<User> {
    return request<User>("/api/auth/me", {
        headers: authHeaders(),
    });
}

export async function updateUser(input: UpdateUserInput): Promise<User> {
    return request<User>("/api/auth/me", {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify(input),
    });
}

export async function deleteUser(): Promise<void> {
    return request<void>("/api/auth/me", {
        method: "DELETE",
        headers: authHeaders(),
    });
}
