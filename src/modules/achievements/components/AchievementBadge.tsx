import { Award, Gem, Sparkles, type LucideIcon } from "lucide-react";
import { clsx } from "clsx";

interface AchievementBadgeProps {
    type: string;
    completed: boolean;
    size?: "md" | "lg";
}

type BadgeVisual = {
    Icon: LucideIcon;
    gradient: string;
    ring: string;
    glow: string;
};

// CLAN_REACHED_DIAMOND reuses Diamond-tier leaderboard colors (teal→emerald) for visual consistency.
const VISUALS: Record<string, BadgeVisual> = {
    CLAN_REACHED_DIAMOND: {
        Icon: Gem,
        gradient: "from-teal-600 to-emerald-500",
        ring: "ring-emerald-300/70",
        glow: "shadow-emerald-300/50",
    },
};

const DEFAULT_VISUAL: BadgeVisual = {
    Icon: Award,
    gradient: "from-yomu-primary to-yomu-primary-dark",
    ring: "ring-yomu-primary/40",
    glow: "shadow-yomu-primary-light/40",
};

// motion-safe: respects prefers-reduced-motion for the sparkle animation.
export function AchievementBadge({ type, completed, size = "lg" }: AchievementBadgeProps) {
    const visual = VISUALS[type] ?? DEFAULT_VISUAL;
    const Icon = visual.Icon;

    const box = size === "lg" ? "w-16 h-16" : "w-12 h-12";
    const iconSize = size === "lg" ? 34 : 26;
    const sparkleSize = size === "lg" ? 16 : 12;

    return (
        <div
            data-testid="achievement-badge"
            role="img"
            aria-label={completed ? "Lencana terbuka" : "Lencana terkunci"}
            className={clsx(
                "relative rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md transition-all duration-300",
                box,
                completed
                    ? clsx("bg-gradient-to-br text-white scale-105 ring-2", visual.gradient, visual.ring, visual.glow)
                    : "bg-gray-100 text-yomu-text-secondary border border-gray-200"
            )}
        >
            <Icon size={iconSize} aria-hidden="true" />
            {completed && (
                <Sparkles
                    data-testid="achievement-badge-sparkle"
                    size={sparkleSize}
                    aria-hidden="true"
                    className="absolute -top-1.5 -right-1.5 text-amber-300 drop-shadow-sm motion-safe:animate-pulse"
                />
            )}
        </div>
    );
}
