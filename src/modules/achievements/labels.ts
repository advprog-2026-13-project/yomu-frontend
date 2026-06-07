const TYPE_LABELS: Record<string, string> = {
    READING_COMPLETED: "Selesai Baca",
    QUIZ_COMPLETED: "Selesai Kuis",
    CLAN_REACHED_DIAMOND: "Liga Diamond",
};

// Unknown types fall back to Title Case using split("_"), replacing ALL underscores
// unlike .replace("_", " ") which only replaces the first occurrence.
export function achievementTypeLabel(type: string): string {
    if (TYPE_LABELS[type]) {
        return TYPE_LABELS[type];
    }
    return type
        .toLowerCase()
        .split("_")
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}
