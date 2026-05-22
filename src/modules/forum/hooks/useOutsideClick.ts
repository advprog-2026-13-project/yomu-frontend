import { useEffect } from "react";
import type { RefObject } from "react";

export function useOutsideClick<T extends HTMLElement>(
    ref: RefObject<T>,
    onOutside: () => void,
    enabled = true
) {
    useEffect(() => {
        if (!enabled) return;
        function handleClick(event: MouseEvent) {
            if (!ref.current || ref.current.contains(event.target as Node)) {
                return;
            }
            onOutside();
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [ref, onOutside, enabled]);
}
