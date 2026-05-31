"use client";

import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import Link from "next/link";
import { Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/src/modules/auth";
import { PasswordInput, PasswordStrengthIndicator, AuthVisualPanel } from "@/src/app/components/auth";

export default function RegisterPage() {
    const { register, loginWithGoogle, loading, error, clearError } = useAuth();
    const [displayName, setDisplayName] = useState("");
    const [username, setUsername] = useState("");
    const [contact, setContact] = useState("");
    const [password, setPassword] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        setSuccess(false);

        const isEmail = contact.includes("@");
        await register({
            username,
            displayName,
            email: isEmail ? contact : null,
            phoneNumber: isEmail ? null : contact || null,
            password,
        });
        setSuccess(true);
    };

    const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
        clearError();
        if (!credentialResponse.credential) return;
        await loginWithGoogle(credentialResponse.credential);
    };

    return (
        <div className="flex h-screen w-full">
            {/* Left side - Register Form (40%) */}
            <div className="w-2/5 bg-surface flex flex-col justify-center px-8 md:px-12 lg:px-16">
                <div className="max-w-md w-full">
                    {/* Logo */}
                    <div className="mb-10">
                        <h1 className="text-4xl font-bold mb-3" style={{ color: "#1D9E75" }}>
                            Yomu
                        </h1>
                        <p className="text-lg" style={{ color: "#5F5E5A" }}>
                            Mulai perjalanan literasimu
                        </p>
                    </div>

                    {/* Register Form */}
                    <div className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        {success && (
                            <Alert>
                                <AlertDescription>Register success! Redirecting to login...</AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="displayName" className="block text-sm font-medium mb-2" style={{ color: "#2C2C2A" }}>
                                    Nama Lengkap
                                </label>
                                <Input
                                    id="displayName"
                                    type="text"
                                    placeholder="Masukkan nama lengkap"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="h-12"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="username" className="block text-sm font-medium mb-2" style={{ color: "#2C2C2A" }}>
                                    Username
                                </label>
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder="Pilih username unik"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="h-12"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="contact" className="block text-sm font-medium mb-2" style={{ color: "#2C2C2A" }}>
                                    Email atau Nomor HP
                                </label>
                                <Input
                                    id="contact"
                                    type="text"
                                    placeholder="nama@email.com atau 08123456789"
                                    value={contact}
                                    onChange={(e) => setContact(e.target.value)}
                                    className="h-12"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: "#2C2C2A" }}>
                                    Password
                                </label>
                                <PasswordInput
                                    id="password"
                                    placeholder="Buat password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <PasswordStrengthIndicator password={password} />
                            </div>

                            <Button type="submit" className="w-full h-12 text-base font-medium mt-6" disabled={loading} style={{ backgroundColor: "#1D9E75", color: "#FFFFFF" }}>
                                {loading ? "Membuat akun..." : "Buat Akun"}
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
                                onError={() => alert("Google Auth Failed")}
                                text="signup_with"
                                shape="pill"
                                size="large"
                                width="320"
                            />
                        </div>

                        {/* Footer link */}
                        <div className="text-center mt-6">
                            <span style={{ color: "#5F5E5A" }}>Sudah punya akun? </span>
                            <Link href="/auth/login" className="font-medium hover:underline" style={{ color: "#1D9E75" }}>
                                Masuk
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side - Visual Panel (60%) */}
            <AuthVisualPanel
                illustrationIcon={
                    <Award className="w-32 h-32 text-white/80" strokeWidth={1.5} />
                }
            />
        </div>
    );
}
