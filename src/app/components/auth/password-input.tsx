"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PasswordInputProps extends React.ComponentProps<"input"> {
    inputClassName?: string;
}

export function PasswordInput({ className, inputClassName, ...props }: PasswordInputProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className={cn("relative", className)}>
            <Input
                {...props}
                type={showPassword ? "text" : "password"}
                className={cn("h-12 pr-12", inputClassName)}
            />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
            >
                {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
        </div>
    );
}
