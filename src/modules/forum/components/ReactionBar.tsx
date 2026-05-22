"use client";

import { useState, useEffect, useRef } from "react";
import { SmilePlus } from "lucide-react";
import type { ReactionType } from "../types";
import { REACTION_META } from "../types";

interface ReactionBarProps {
    commentId: string;
    reactionCounts: Partial<Record<ReactionType, number>>;
    onReact: (commentId: string, type: ReactionType) => void;
}

export function ReactionBar({ commentId, reactionCounts, onReact }: ReactionBarProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const reactions = (
        Object.entries(reactionCounts) as [ReactionType, number][]
    ).filter(([, count]) => count > 0);

    return (
        <div className="flex items-center gap-2 flex-wrap" ref={ref}>
            {reactions.map(([type, count]) => (
                <button
                    key={type}
                    onClick={() => onReact(commentId, type)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yomu-primary-light border border-yomu-primary/20 text-xs font-medium text-yomu-primary hover:bg-yomu-primary/20 transition-colors"
                    title={REACTION_META[type]?.label}
                >
                    <span>{REACTION_META[type]?.emoji}</span>
                    <span>{count}</span>
                </button>
            ))}

            <div className="relative">
                <button
                    onClick={() => setOpen((o) => !o)}
                    id={`reaction-picker-${commentId}`}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-yomu-border text-xs text-yomu-text-secondary hover:border-yomu-primary hover:text-yomu-primary transition-colors"
                    title="Tambah reaksi"
                >
                    <SmilePlus className="h-3.5 w-3.5" />
                </button>

                {open && (
                    <div className="absolute bottom-full left-0 mb-1 z-50 bg-yomu-surface border border-yomu-border rounded-xl shadow-lg p-2 flex gap-1 flex-wrap w-56">
                        {(Object.keys(REACTION_META) as ReactionType[]).map((type) => (
                            <button
                                key={type}
                                onClick={() => {
                                    onReact(commentId, type);
                                    setOpen(false);
                                }}
                                className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs hover:bg-yomu-primary-light transition-colors"
                                title={REACTION_META[type].label}
                            >
                                <span className="text-base">{REACTION_META[type].emoji}</span>
                                <span className="text-yomu-text-secondary">
                                    {REACTION_META[type].label}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
