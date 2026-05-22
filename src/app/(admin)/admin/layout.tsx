"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { BookOpen, LayoutDashboard, MessageSquare, Trophy, Users, Users as UsersSocial, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getToken, removeToken, fetchUser } from "@/src/modules/auth/api";

const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/content", label: "Content", icon: BookOpen },
    { href: "/admin/moderation", label: "Forum", icon: MessageSquare },
    { href: "/admin/gamification", label: "Achievements", icon: Trophy },
    { href: "/admin/social", label: "Social", icon: UsersSocial },
    { href: "/admin/users", label: "Users", icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = getToken();
        if (!token) {
            router.replace("/auth/login");
            return;
        }

        fetchUser()
            .then((data) => {
                if (data.role !== "ADMIN") {
                    router.replace("/dashboard");
                } else {
                    setLoading(false);
                }
            })
            .catch(() => {
                removeToken();
                router.replace("/auth/login");
            });
    }, [router]);

    const handleLogout = () => {
        removeToken();
        router.push("/auth/login");
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-muted-foreground">Loading...</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-background">
            {/* Sidebar */}
            <aside className="w-64 border-r border-border bg-card flex flex-col">
                <div className="p-6 border-b border-border">
                    <h1 className="text-xl font-bold" style={{ color: "var(--primary)" }}>Yomu Admin</h1>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                }`}
                            >
                                <Icon className="size-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-border">
                    <Button variant="outline" className="w-full justify-start gap-2" onClick={handleLogout}>
                        <LogOut className="size-4" />
                        Logout
                    </Button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 p-8 overflow-auto">
                {children}
            </main>
        </div>
    );
}
