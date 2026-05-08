"use client";

import { useRouter } from "next/navigation";
import { getToken } from "@/src/modules/auth/api";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const token = getToken();

    if (!token) {
        router.replace("/auth/login");
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-muted-foreground">Redirecting...</p>
            </div>
        );
    }

    return <>{children}</>;
}
