"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getToken } from "@/src/modules/auth/api";
import { useAuth } from "@/src/modules/auth";
import Link from "next/link";
import { BookOpen, Trophy, Target, MessageSquare, LayoutDashboard, User, LogOut, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const token = getToken();
    const { user, logout } = useAuth();

    useEffect(() => {
        if (!token) {
            router.replace("/auth/login");
        }
    }, [token, router]);

    if (!token) {
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

    if (user?.role === "ADMIN") {
        navLinks.push(
            { href: "/admin/readings", label: "Kelola Bacaan", icon: BookOpen },
            { href: "/admin/achievements", label: "Kelola Pencapaian", icon: Target }
        );
    }

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
                            // Check precise match for admin or dashboard to prevent sub-route highlight confusion
                            const isActive = link.href === "/dashboard" 
                                ? pathname === "/dashboard" 
                                : pathname.startsWith(link.href);
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
            <AchievementNotifier />
        </div>
    );
}

interface ActiveToast {
    id: string;
    title: string;
    description: string;
    name?: string;
}

function AchievementNotifier() {
    const { user } = useAuth();
    const [toasts, setToasts] = useState<ActiveToast[]>([]);
    const [masterAchievements, setMasterAchievements] = useState<Record<string, { name: string; description: string }>>({});
    
    // Fetch master achievements to map UUID to Name
    useEffect(() => {
        if (!user?.id) return;

        const fetchMaster = async () => {
            try {
                const token = getToken();
                if (!token) return;
                const res = await fetch("/api/achievements", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        const map: Record<string, { name: string; description: string }> = {};
                        data.forEach(ach => {
                            map[ach.id] = ach;
                        });
                        setMasterAchievements(map);
                    }
                }
            } catch {
                // ignore
            }
        };
        fetchMaster();
    }, [user?.id]);
    
    // Polling effect in the background
    useEffect(() => {
        if (!user?.id) return;
        
        const checkForAchievements = async () => {
            try {
                const token = getToken();
                if (!token) return;
                
                const res = await fetch(`/api/achievements/users/${user.id}/completed`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                
                if (res.ok) {
                    const completed = await res.json();
                    if (Array.isArray(completed)) {
                        const notified = JSON.parse(localStorage.getItem("notified_achievements") || "[]");
                        
                        completed.forEach(ach => {
                            if (!notified.includes(ach.achievementId)) {
                                // Found a new achievement!
                                const achInfo = masterAchievements[ach.achievementId];
                                const achName = achInfo?.name || "Pencapaian Baru!";
                                const achDesc = achInfo?.description || "Selamat! Anda telah membuka pencapaian baru.";
                                
                                // Show Toast instead of Alert for STUDENTS
                                if (user.role === "STUDENT") {
                                    setToasts(prev => [
                                        ...prev, 
                                        { 
                                            id: ach.achievementId, 
                                            title: "🏆 Pencapaian Terbuka!", 
                                            description: achDesc,
                                            name: achName
                                        }
                                    ]);
                                } else {
                                    // For admins or other roles, you can show toast as well
                                    setToasts(prev => [
                                        ...prev, 
                                        { 
                                            id: ach.achievementId, 
                                            title: "🏆 Pencapaian Terbuka!", 
                                            description: achDesc,
                                            name: achName
                                        }
                                    ]);
                                }
                                
                                notified.push(ach.achievementId);
                                localStorage.setItem("notified_achievements", JSON.stringify(notified));
                            }
                        });
                    }
                }
            } catch {
                // ignore polling errors
            }
        };
        
        // Check immediately, then every 5 seconds
        checkForAchievements();
        const interval = setInterval(checkForAchievements, 5000);
        return () => clearInterval(interval);
    }, [user?.id, user?.role, masterAchievements]);
    
    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
            {toasts.map((toast) => (
                <AchievementToast 
                    key={toast.id} 
                    toast={toast} 
                    onClose={() => removeToast(toast.id)} 
                />
            ))}
        </div>
    );
}

function AchievementToast({ toast, onClose }: { toast: ActiveToast; onClose: () => void }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 8000); // Display for 8 seconds
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="pointer-events-auto bg-yomu-surface border border-yomu-primary/20 shadow-2xl rounded-2xl p-4 flex gap-3 relative overflow-hidden transition-all duration-300 animate-slide-in-right">
            {/* Golden glow gradient background effect */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-yomu-primary/5 rounded-full blur-xl pointer-events-none" />
            
            {/* Golden Trophy Icon */}
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-yomu-primary to-yomu-primary-dark rounded-xl flex items-center justify-center text-white shadow-md shadow-yomu-primary/20">
                <Trophy className="h-6 w-6 animate-pulse" />
            </div>
            
            {/* Content */}
            <div className="flex-grow space-y-1 pr-6">
                <div className="flex items-center gap-1">
                    <span className="text-[10px] font-extrabold text-yomu-primary uppercase tracking-wider">
                        {toast.title}
                    </span>
                    <Sparkles className="h-3 w-3 text-yomu-primary" />
                </div>
                <h4 className="text-sm font-bold text-yomu-foreground font-heading leading-snug">
                    {toast.name}
                </h4>
                <p className="text-[11px] text-yomu-text-secondary leading-relaxed">
                    {toast.description}
                </p>
            </div>
            
            {/* Close Button */}
            <button 
                onClick={onClose}
                className="absolute top-3 right-3 text-yomu-text-secondary hover:text-yomu-primary p-0.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
                <X className="h-4 w-4" />
            </button>
            
            {/* Animated Progress Bar Timer */}
            <div 
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-yomu-primary to-yomu-accent animate-shrink-width w-full" 
                style={{ animationDuration: "8s", animationTimingFunction: "linear" }} 
            />
        </div>
    );
}
