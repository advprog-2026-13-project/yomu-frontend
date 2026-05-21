import { useState, useEffect } from "react";
import type { 
    Achievement, 
    DailyMission, 
    UserAchievementProgress, 
    UserDailyMissionProgress 
} from "./types";
import * as api from "./api";
import { useAuth } from "../auth/hooks/useAuth";

export function useUserAchievements() {
    const { user } = useAuth();
    
    const [progress, setProgress] = useState<UserAchievementProgress[]>([]);
    const [dailyProgress, setDailyProgress] = useState<UserDailyMissionProgress[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!user?.id) {
            Promise.resolve().then(() => setLoading(false));
            return;
        }

        const userId = user.id;
        const load = async () => {
            setLoading(true);
            try {
                const [progData, dailyProgData] = await Promise.all([
                    api.fetchUserProgress(userId),
                    api.fetchUserDailyProgress(userId)
                ]);
                setProgress(progData);
                setDailyProgress(dailyProgData);
            } catch (err) {
                setError(err instanceof Error ? err : new Error(String(err)));
            } finally {
                setLoading(false);
            }
        };
        Promise.resolve().then(() => load());
    }, [user?.id]);

    return { progress, dailyProgress, loading, error };
}

export function useMasterAchievements() {
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [dailyMissions, setDailyMissions] = useState<DailyMission[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        Promise.all([
            api.fetchAllAchievements(),
            api.fetchAllDailyMissions()
        ])
            .then(([achData, missionData]) => {
                setAchievements(achData);
                setDailyMissions(missionData);
            })
            .catch(setError)
            .finally(() => setLoading(false));
    }, []);

    return { achievements, dailyMissions, loading, error };
}

export function useAdminAchievementActions() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const createAchievement = async (payload: {
        name: string;
        description: string;
        type: string;
        milestone: number;
    }) => {
        setLoading(true);
        setError(null);
        try {
            return await api.adminCreateAchievement(payload);
        } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
            return null;
        } finally {
            setLoading(false);
        }
    };

    const updateAchievement = async (id: string, payload: {
        name?: string;
        description?: string;
        milestone?: number;
    }) => {
        setLoading(true);
        setError(null);
        try {
            return await api.adminUpdateAchievement(id, payload);
        } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
            return null;
        } finally {
            setLoading(false);
        }
    };

    const deleteAchievement = async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            await api.adminDeleteAchievement(id);
            return true;
        } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
            return false;
        } finally {
            setLoading(false);
        }
    };

    const createDailyMission = async (payload: {
        name: string;
        description: string;
        targetType: string;
        milestone: number;
    }) => {
        setLoading(true);
        setError(null);
        try {
            return await api.adminCreateDailyMission(payload);
        } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
            return null;
        } finally {
            setLoading(false);
        }
    };

    const updateDailyMission = async (id: string, payload: {
        name?: string;
        description?: string;
        milestone?: number;
    }) => {
        setLoading(true);
        setError(null);
        try {
            return await api.adminUpdateDailyMission(id, payload);
        } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
            return null;
        } finally {
            setLoading(false);
        }
    };

    const deleteDailyMission = async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            await api.adminDeleteDailyMission(id);
            return true;
        } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
            return false;
        } finally {
            setLoading(false);
        }
    };

    const resetAll = async () => {
        setLoading(true);
        setError(null);
        try {
            await api.adminResetAll();
            return true;
        } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
            return false;
        } finally {
            setLoading(false);
        }
    };

    const resetForUser = async (userId: string) => {
        setLoading(true);
        setError(null);
        try {
            await api.adminResetForUser(userId);
            return true;
        } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { 
        createAchievement, 
        updateAchievement, 
        deleteAchievement, 
        createDailyMission, 
        updateDailyMission, 
        deleteDailyMission, 
        resetAll, 
        resetForUser, 
        loading, 
        error 
    };
}


