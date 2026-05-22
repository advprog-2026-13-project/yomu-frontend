import { getToken } from "../auth/api";
import { BACKEND_URL } from "../admin/constants";
import type {
    Clan,
    JoinRequest,
    ClanMember,
    LeaderboardEntry,
    CreateClanInput,
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

// Clans
export async function createClan(input: CreateClanInput): Promise<Clan> {
    return request<Clan>(api("/api/social/clans"), {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(input),
    });
}

export async function getMyClan(): Promise<Clan> {
    return request<Clan>(api("/api/social/clans/me"), { headers: authHeaders() });
}

export async function leaveClan(): Promise<void> {
    return request<void>(api("/api/social/clans/leave"), {
        method: "DELETE",
        headers: authHeaders(),
    });
}

export async function deleteClan(clanId: string): Promise<void> {
    return request<void>(api(`/api/social/clans/${clanId}`), {
        method: "DELETE",
        headers: authHeaders(),
    });
}

export async function getClanById(clanId: string): Promise<Clan> {
    return request<Clan>(api(`/api/social/clans/${clanId}`), { headers: authHeaders() });
}

// Join Requests
export async function requestToJoinClan(clanId: string): Promise<JoinRequest> {
    return request<JoinRequest>(api(`/api/social/clans/${clanId}/join-requests`), {
        method: "POST",
        headers: authHeaders(),
    });
}

export async function getClanJoinRequests(clanId: string): Promise<JoinRequest[]> {
    return request<JoinRequest[]>(api(`/api/social/clans/${clanId}/join-requests`), { headers: authHeaders() });
}

export async function approveJoinRequest(clanId: string, requestId: string): Promise<void> {
    return request<void>(api(`/api/social/clans/${clanId}/join-requests/${requestId}/approve`), {
        method: "POST",
        headers: authHeaders(),
    });
}

export async function rejectJoinRequest(clanId: string, requestId: string): Promise<void> {
    return request<void>(api(`/api/social/clans/${clanId}/join-requests/${requestId}/reject`), {
        method: "POST",
        headers: authHeaders(),
    });
}

// Leaderboard
export async function getLeaderboard(tier: string): Promise<LeaderboardEntry[]> {
    return request<LeaderboardEntry[]>(api(`/api/social/leaderboard?tier=${tier}`));
}

// Admin Social
export async function adminGetClans(): Promise<Clan[]> {
    return request<Clan[]>(api("/api/admin/social/clans"), { headers: authHeaders() });
}

export async function adminGetClanMembers(clanId: string): Promise<ClanMember[]> {
    return request<ClanMember[]>(api(`/api/admin/social/clans/${clanId}/members`), { headers: authHeaders() });
}

export async function adminRemoveMember(clanId: string, userId: string): Promise<void> {
    return request<void>(api(`/api/admin/social/clans/${clanId}/members/${userId}`), {
        method: "DELETE",
        headers: authHeaders(),
    });
}

export async function adminDeleteClan(clanId: string): Promise<void> {
    return request<void>(api(`/api/admin/social/clans/${clanId}`), {
        method: "DELETE",
        headers: authHeaders(),
    });
}

export async function adminGetJoinRequests(): Promise<JoinRequest[]> {
    return request<JoinRequest[]>(api("/api/admin/social/join-requests"), { headers: authHeaders() });
}

export async function endSeason(): Promise<void> {
    return request<void>(api("/api/admin/social/seasons/end"), {
        method: "POST",
        headers: authHeaders(),
    });
}
