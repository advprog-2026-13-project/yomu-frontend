function getStrength(pwd: string) {
    if (pwd.length === 0) return { level: 0, label: "" };
    if (pwd.length < 6) return { level: 1, label: "Lemah" };
    if (pwd.length < 10) return { level: 2, label: "Sedang" };
    return { level: 3, label: "Kuat" };
}

const colors = ["#D3D1C7", "#E24B4A", "#EF9F27", "#639922"];

interface PasswordStrengthIndicatorProps {
    password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
    const { level, label } = getStrength(password);

    if (password.length === 0) return null;

    return (
        <div className="mt-2">
            <div className="flex gap-1.5 mb-1">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="h-1.5 flex-1 rounded-full transition-colors"
                        style={{ backgroundColor: level >= i ? colors[i] : colors[0] }}
                    />
                ))}
            </div>
            <p className="text-xs" style={{ color: colors[level] }}>
                {label}
            </p>
        </div>
    );
}
