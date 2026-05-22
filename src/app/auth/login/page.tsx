"use client";

import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/src/modules/auth";
import { PasswordInput, AuthVisualPanel } from "@/src/app/components/auth";

export default function LoginPage() {
    const { login, loginWithGoogle, loading, error, clearError } = useAuth();
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        await login({ identifier, password });
    };

    const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
        clearError();
        if (!credentialResponse.credential) return;
        await loginWithGoogle(credentialResponse.credential);
    };

    return (
        <div className="flex h-screen w-full">
            {/* Left side - Login Form (40%) */}
            <div className="w-2/5 bg-surface flex flex-col justify-center px-8 md:px-12 lg:px-16">
                <div className="max-w-md w-full">
                    {/* Logo and tagline */}
                    <div className="mb-12">
                        <h1 className="text-4xl font-bold mb-3" style={{ color: "#1D9E75" }}>
                            Yomu
                        </h1>
                        <p className="text-lg" style={{ color: "#5F5E5A" }}>
                            Baca lebih dalam. Pahami lebih baik.
                        </p>
                    </div>

                    {/* Login Form */}
                    <div className="space-y-5">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="identifier" className="block text-sm font-medium mb-2" style={{ color: "#2C2C2A" }}>
                                    Email atau Username
                                </label>
                                <Input
                                    id="identifier"
                                    type="text"
                                    placeholder="nama@email.com"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    className="h-12"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: "#2C2C2A" }}>
                                    Password
                                </label>
                                <PasswordInput
                                    id="password"
                                    placeholder="Masukkan password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="flex justify-end">
                                <a href="#" className="text-sm font-medium hover:underline" style={{ color: "#1D9E75" }}>
                                    Lupa password?
                                </a>
                            </div>

                            <Button type="submit" className="w-full h-12 text-base font-medium" disabled={loading} style={{ backgroundColor: "#1D9E75", color: "#FFFFFF" }}>
                                {loading ? "Masuk..." : "Masuk"}
                            </Button>
                        </form>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t" style={{ borderColor: "#D3D1C7" }} />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-surface" style={{ color: "#5F5E5A" }}>
                                    atau
                                </span>
                            </div>
                        </div>

                        {/* Google SSO */}
                        <div className="flex justify-center">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => alert("Google Login Failed")}
                                useOneTap
                                text="signin_with"
                                shape="pill"
                                size="large"
                                width="320"
                            />
                        </div>

                        {/* Footer link */}
                        <div className="text-center mt-6">
                            <span style={{ color: "#5F5E5A" }}>Belum punya akun? </span>
                            <Link href="/auth/register" className="font-medium hover:underline" style={{ color: "#1D9E75" }}>
                                Daftar sekarang
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side - Visual Panel (60%) */}
            <AuthVisualPanel
                illustrationIcon={
                    <BookOpen className="w-32 h-32 text-white/80" strokeWidth={1.5} />
                }
                socialProof={
                    <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-2xl" style={{ maxWidth: "380px", margin: "0 auto" }}>
                        <div className="flex items-center gap-3">
                            <div className="text-4xl">🔥</div>
                            <div>
                                <p className="text-2xl font-bold" style={{ color: "#2C2C2A" }}>
                                    12.400
                                </p>
                                <p style={{ color: "#5F5E5A" }}>pelajar aktif minggu ini</p>
                            </div>
                        </div>
                    </div>
                }
                floatingBadge={
                    <div className="text-center">
                        <div className="text-3xl mb-1">⭐</div>
                        <p className="text-xs font-medium" style={{ color: "#EF9F27" }}>
                            +50 XP
                        </p>
                        <p className="text-xs" style={{ color: "#5F5E5A" }}>
                            Artikel Selesai
                        </p>
                    </div>
                }
            />
        </div>
    );
}
