"use client";

import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/src/modules/auth";

export default function LoginPage() {
    const { login, loginWithGoogle, loading, error, clearError } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        await login({ identifier: username, password });
    };

    const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
        clearError();
        await loginWithGoogle(credentialResponse.credential);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Login Yomu</CardTitle>
                    <CardDescription>Masuk ke akun kamu</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username or Email</Label>
                            <Input
                                id="username"
                                placeholder="username or email"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Logging in..." : "Login"}
                        </Button>
                    </form>

                    <Separator className="relative">
                        <span className="absolute left-1/2 -translate-x-1/2 bg-background px-2 text-xs text-muted-foreground">
                            atau
                        </span>
                    </Separator>

                    <div className="flex justify-center">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => alert("Google Login Failed")}
                            useOneTap
                        />
                    </div>
                </CardContent>
                <CardFooter className="justify-center">
                    <p className="text-sm text-muted-foreground">
                        Belum punya akun?{" "}
                        <Link href="/auth/register" className="text-primary underline-offset-4 hover:underline">
                            Daftar di sini
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
