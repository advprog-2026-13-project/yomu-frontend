export function getInitials(name: string): string {
    return name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase();
}

export function stringToColor(str: string): string {
    const palette = [
        "#1D9E75", "#085041", "#EF9F27", "#378ADD", "#639922",
        "#7C3AED", "#DC2626", "#0891B2", "#D97706", "#059669",
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return palette[Math.abs(hash) % palette.length];
}

interface AvatarProps {
    name: string;
    size?: "xs" | "sm" | "md" | "lg";
}

export function Avatar({ name, size = "md" }: AvatarProps) {
    const bg = stringToColor(name);
    const sizeClass =
        size === "xs" ? "h-6 w-6 text-[10px]" :
        size === "sm" ? "h-7 w-7 text-xs" :
        size === "lg" ? "h-11 w-11 text-base" :
        "h-9 w-9 text-sm";

    return (
        <div
            className={`${sizeClass} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 select-none`}
            style={{ backgroundColor: bg }}
            aria-label={`Avatar ${name}`}
        >
            {getInitials(name)}
        </div>
    );
}
