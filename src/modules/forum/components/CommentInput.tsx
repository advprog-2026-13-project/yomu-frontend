"use client";

import { useState } from "react";
import { Send, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CommentInputProps {
    id: string;
    placeholder: string;
    onSubmit: (content: string) => Promise<void>;
    onCancel?: () => void;
    loading: boolean;
    defaultValue?: string;
    autoFocus?: boolean;
}

export function CommentInput({
    id,
    placeholder,
    onSubmit,
    onCancel,
    loading,
    defaultValue = "",
    autoFocus = false,
}: CommentInputProps) {
    const [value, setValue] = useState(defaultValue);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!value.trim()) return;
        await onSubmit(value.trim());
        setValue("");
    }

    return (
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
            <div className="flex-1">
                <textarea
                    id={id}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={placeholder}
                    autoFocus={autoFocus}
                    rows={2}
                    className="w-full resize-none rounded-xl border border-yomu-border bg-yomu-surface px-4 py-3 text-sm text-yomu-foreground placeholder:text-yomu-text-secondary focus:outline-none focus:border-yomu-primary focus:ring-2 focus:ring-yomu-primary/20 transition-all leading-relaxed"
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit(e as unknown as React.FormEvent);
                        }
                    }}
                />
            </div>
            <div className="flex gap-1.5 pb-0.5">
                {onCancel && (
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={onCancel}
                        className="h-9 w-9 rounded-xl text-yomu-text-secondary hover:bg-muted"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
                <Button
                    type="submit"
                    size="icon"
                    disabled={loading || !value.trim()}
                    className="h-9 w-9 rounded-xl bg-yomu-primary hover:bg-yomu-primary-dark text-white disabled:opacity-40"
                >
                    {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Send className="h-4 w-4" />
                    )}
                </Button>
            </div>
        </form>
    );
}
