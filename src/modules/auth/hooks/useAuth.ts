import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import * as authApi from "../api";
import type { User, LoginInput, RegisterInput, UpdateUserInput } from "../types";

export function useAuth() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const login = useCallback(async (input: LoginInput) => {
        setLoading(true);
        setError(null);
        try {
            const res = await authApi.login(input);
            const token = res.token ?? res.accessToken ?? res.jwt;
            if (!token) throw new Error("Token not found in response");
            authApi.setToken(token);
            router.push("/dashboard");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed");
        } finally {
            setLoading(false);
        }
    }, [router]);

    const register = useCallback(async (input: RegisterInput) => {
        setLoading(true);
        setError(null);
        try {
            await authApi.register(input);
            router.push("/auth/login");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Registration failed");
        } finally {
            setLoading(false);
        }
    }, [router]);

    const loginWithGoogle = useCallback(async (credential: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await authApi.loginWithGoogle(credential);
            const token = res.token ?? res.accessToken ?? res.jwt;
            if (!token) throw new Error("Token not found in response");
            authApi.setToken(token);
            router.push("/dashboard");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Google login failed");
        } finally {
            setLoading(false);
        }
    }, [router]);

    const logout = useCallback(() => {
        authApi.removeToken();
        setUser(null);
        router.push("/auth/login");
    }, [router]);

    const deleteUser = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            await authApi.deleteUser();
            authApi.removeToken();
            setUser(null);
            router.push("/auth/register");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete account");
        } finally {
            setLoading(false);
        }
    }, [router]);

    const updateUser = useCallback(async (input: UpdateUserInput) => {
        setLoading(true);
        setError(null);
        try {
            const updated = await authApi.updateUser(input);
            setUser(updated);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update profile");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchUser = useCallback(async () => {
        const token = authApi.getToken();
        if (!token) {
            router.push("/auth/login");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const data = await authApi.fetchUser();
            setUser(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch user");
            authApi.removeToken();
            router.push("/auth/login");
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        if (authApi.getToken() && !user) {
            fetchUser();
        }
    }, [user, fetchUser]);

    return {
        user,
        loading,
        error,
        login,
        register,
        loginWithGoogle,
        logout,
        deleteUser,
        updateUser,
        fetchUser,
        clearError: () => setError(null),
    };
}
