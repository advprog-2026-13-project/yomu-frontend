import { TrendingUp, TrendingDown } from "lucide-react";

interface ModifierBadgesProps {
    buffActive: boolean;
    debuffActive: boolean;
    size?: "sm" | "md";
    showLabel?: boolean;
}

export function ModifierBadges({
    buffActive,
    debuffActive,
    size = "md",
    showLabel = true,
}: ModifierBadgesProps) {
    if (!buffActive && !debuffActive) return null;

    const iconSize = size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5";
    const pad = size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs";

    return (
        <span className="inline-flex items-center gap-1.5">
            {buffActive && (
                <span
                    className={`inline-flex items-center gap-1 rounded-full font-semibold ${pad}`}
                    style={{ backgroundColor: "#DCFCE7", color: "#15803D" }}
                    title="Productivity Buff aktif (×1.2) — ≥50% anggota menyelesaikan misi harian"
                >
                    <TrendingUp className={iconSize} />
                    {showLabel && "Buff ×1.2"}
                </span>
            )}
            {debuffActive && (
                <span
                    className={`inline-flex items-center gap-1 rounded-full font-semibold ${pad}`}
                    style={{ backgroundColor: "#FEE2E2", color: "#B91C1C" }}
                    title="Low Accuracy Penalty aktif (×0.8) — rata-rata akurasi kuis anggota < 50%"
                >
                    <TrendingDown className={iconSize} />
                    {showLabel && "Debuff ×0.8"}
                </span>
            )}
        </span>
    );
}
