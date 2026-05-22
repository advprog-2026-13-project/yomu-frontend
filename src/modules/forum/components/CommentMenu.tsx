"use client";

import { useState, useEffect, useRef } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

interface CommentMenuProps {
    commentId: string;
    onEdit?: () => void;
    onDelete?: () => void;
    allowEdit?: boolean;
    allowDelete?: boolean;
    deleteLabel?: string;
}

export function CommentMenu({
    commentId,
    onEdit,
    onDelete,
    allowEdit = true,
    allowDelete = true,
    deleteLabel = "Hapus",
}: CommentMenuProps) {
    const shouldRender = allowEdit || allowDelete;
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!shouldRender) {
            return;
        }
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [shouldRender]);

    if (!shouldRender) {
        return null;
    }

    return (
        <div className="relative" ref={ref}>
            <button
                id={`comment-menu-${commentId}`}
                onClick={() => setOpen((o) => !o)}
                className="p-1 rounded-lg text-yomu-text-secondary hover:bg-muted hover:text-yomu-foreground transition-colors"
            >
                <MoreHorizontal className="h-4 w-4" />
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-1 z-50 bg-yomu-surface border border-yomu-border rounded-xl shadow-lg py-1 min-w-[140px] animate-in fade-in zoom-in-95 duration-150">
                    {allowEdit && onEdit && (
                        <button
                            id={`edit-comment-${commentId}`}
                            onClick={() => {
                                onEdit();
                                setOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-yomu-foreground hover:bg-yomu-primary-light hover:text-yomu-primary transition-colors"
                        >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                        </button>
                    )}
                    {allowDelete && onDelete && (
                        <button
                            id={`delete-comment-${commentId}`}
                            onClick={() => {
                                onDelete();
                                setOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-yomu-destructive hover:bg-red-50 transition-colors"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            {deleteLabel}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
