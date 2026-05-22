export type ClanTier = "BRONZE" | "SILVER" | "GOLD" | "DIAMOND";

export interface Clan {
    id: string;
    name: string;
    tier: ClanTier;
    score: number;
    leaderId: string;
    memberCount: number;
}

export interface JoinRequest {
    id: string;
    clanId: string;
    userId: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    createdAt: string;
    resolvedAt: string | null;
}

export interface ClanMember {
    id: string;
    userId: string;
    role: "LEADER" | "MEMBER";
    joinedAt: string;
}

export interface LeaderboardEntry {
    rank: number;
    clanId: string;
    clanName: string;
    score: number;
    tier: ClanTier;
}

export interface CreateClanInput {
    name: string;
}
