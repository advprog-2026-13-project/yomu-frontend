export type ClanTier = "BRONZE" | "SILVER" | "GOLD" | "DIAMOND";

export interface ClanModifierStatus {
    productivityBuffActive: boolean;
    lowAccuracyPenaltyActive: boolean;
    dailyMissionCompletionRate: number;
    averageAccuracy: number;
}

export interface Clan {
    id: string;
    name: string;
    tier: ClanTier;
    score: number;
    leaderId: string;
    memberCount: number;
    modifiers?: ClanModifierStatus | null;
}

export interface JoinRequest {
    id: string;
    clanId: string;
    userId: string;
    username: string | null;
    status: "PENDING" | "APPROVED" | "REJECTED";
    createdAt: string;
    resolvedAt: string | null;
}

export interface ClanMember {
    id: string;
    userId: string;
    username: string | null;
    role: "LEADER" | "MEMBER";
    joinedAt: string;
}

export interface LeaderboardEntry {
    rank: number;
    clanId: string;
    clanName: string;
    score: number;
    tier: ClanTier;
    buffActive: boolean;
    debuffActive: boolean;
}

export interface CreateClanInput {
    name: string;
}
