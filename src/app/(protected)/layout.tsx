"use client";

import { useRouter, usePathname } from "next/navigation";
import { getToken } from "@/src/modules/auth/api";
import { useAuth } from "@/src/modules/auth";
import Link from "next/link";
import { BookOpen, Trophy, Target, MessageSquare, LayoutDashboard, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const token = getToken();
    const { logout } = useAuth();

    if (!token) {
        router.replace("/auth/login");
        return (
            <div className="flex min-h-screen items-center justify-center bg-yomu-background">
                <p className="text-yomu-text-secondary">Redirecting to login...</p>
            </div>
        );
    }

    const navLinks = [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/readings", label: "Katalog", icon: BookOpen },
        { href: "/achievements", label: "Pencapaian", icon: Target },
        { href: "/league", label: "League", icon: Trophy },
        { href: "/forum", label: "Forum", icon: MessageSquare },
    ];

    return (
        <div className="min-h-screen bg-yomu-background flex flex-col">
            {/* Top Navbar */}
            <header className="w-full bg-yomu-surface border-b border-yomu-border sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="font-serif text-xl font-bold text-yomu-primary-dark">Yomu</span>
                    </div>
                    
                    {/* Main Navigation */}
                    <nav className="flex-1 flex justify-center gap-1 md:gap-2 overflow-x-auto px-4">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname.startsWith(link.href);
                            return (
                                <Link 
                                    key={link.href} 
                                    href={link.href}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                                        isActive 
                                        ? "bg-yomu-primary-light text-yomu-primary" 
                                        : "text-yomu-text-secondary hover:bg-yomu-surface hover:text-yomu-primary"
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{link.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right side Profile & Logout */}
                    <div className="flex items-center gap-1 md:gap-2">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            asChild 
                            className={`rounded-full ${pathname === '/profile' ? 'bg-yomu-primary-light text-yomu-primary' : 'text-yomu-text-secondary hover:text-yomu-primary'}`}
                        >
                            <Link href="/profile">
                                <User className="h-5 w-5" />
                            </Link>
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={logout} 
                            className="text-yomu-destructive hover:bg-yomu-destructive/10 rounded-full"
                        >
                            <LogOut className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </header>

            {/* Page Content */}
            <main className="flex-grow">
                {children}
            </main>
        </div>
    );
}
