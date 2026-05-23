interface AuthVisualPanelProps {
    illustrationIcon?: React.ReactNode;
    socialProof?: React.ReactNode;
    floatingBadge?: React.ReactNode;
}

export function AuthVisualPanel({ illustrationIcon, socialProof, floatingBadge }: AuthVisualPanelProps) {
    return (
        <div className="w-3/5 relative overflow-hidden flex items-center justify-center" style={{ backgroundColor: "#085041" }}>
            <div className="absolute inset-0 opacity-10">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
                        backgroundSize: "48px 48px",
                    }}
                />
            </div>

            <div className="relative z-10 max-w-lg px-12">
                {illustrationIcon && (
                    <div className="mb-8 relative">
                        <div className="w-64 h-64 mx-auto rounded-3xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                            {illustrationIcon}
                        </div>
                    </div>
                )}

                {socialProof}

                {floatingBadge && (
                    <div className="absolute top-20 right-12 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl rotate-6" style={{ width: "140px" }}>
                        {floatingBadge}
                    </div>
                )}
            </div>
        </div>
    );
}
