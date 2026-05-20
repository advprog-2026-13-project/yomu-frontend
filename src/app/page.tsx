import Link from "next/link";
import { ArrowRight, BookOpen, ShieldCheck, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
    return (
        <div className="min-h-screen bg-yomu-background flex flex-col font-sans text-yomu-foreground">
            {/* Header / Navbar */}
            <header className="w-full bg-yomu-surface border-b border-yomu-border sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <BookOpen className="h-8 w-8 text-yomu-primary" />
                        <span className="font-serif text-2xl font-bold text-yomu-primary-dark">Yomu</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/auth/login" className="text-yomu-text-secondary hover:text-yomu-primary font-medium transition-colors">
                            Masuk
                        </Link>
                        <Button asChild className="bg-yomu-primary text-white hover:bg-yomu-primary-dark rounded-full px-6">
                            <Link href="/auth/register">Daftar Sekarang</Link>
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow">
                {/* Hero Section */}
                <section className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center overflow-x-hidden">
                    <div className="space-y-8 z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yomu-primary-light text-yomu-primary text-sm font-semibold">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yomu-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yomu-primary"></span>
                            </span>
                            Platform Literasi Informasi #1
                        </div>
                        <h1 className="text-5xl md:text-6xl font-serif font-bold text-yomu-foreground leading-tight">
                            Membaca Cerdas, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yomu-primary to-yomu-accent">Lawan Miskonsepsi.</span>
                        </h1>
                        <p className="text-lg text-yomu-text-secondary leading-relaxed">
                            Yomu adalah sebuah aplikasi pembelajaran yang dirancang untuk melatih masyarakat Indonesia dalam mengolah informasi secara benar dan tepat melalui sistem gamifikasi.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Button asChild size="lg" className="bg-yomu-primary text-white hover:bg-yomu-primary-dark h-14 px-8 text-lg rounded-full">
                                <Link href="/auth/register">
                                    Mulai Belajar <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                            <Button asChild size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-yomu-border text-yomu-foreground hover:bg-yomu-surface bg-transparent">
                                <Link href="#tentang">Pelajari Lebih Lanjut</Link>
                            </Button>
                        </div>
                    </div>
                    
                    {/* Hero Image */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-yomu-primary/20 to-yomu-accent/20 rounded-[2rem] transform translate-x-4 translate-y-4"></div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1471&auto=format&fit=crop" 
                            alt="Mahasiswa belajar bersama" 
                            className="relative z-10 w-full h-[500px] object-cover rounded-[2rem] shadow-2xl border border-white/20"
                        />
                        {/* Floating elements */}
                        <div className="absolute -left-4 md:-left-12 top-12 z-20 bg-yomu-surface p-4 rounded-xl shadow-lg border border-yomu-border flex items-center gap-3 animate-bounce" style={{animationDuration: '3s'}}>
                            <div className="bg-yomu-success/20 p-2 rounded-full">
                                <ShieldCheck className="h-6 w-6 text-yomu-success" />
                            </div>
                            <div>
                                <p className="text-xs text-yomu-text-secondary">Akurasi Informasi</p>
                                <p className="font-bold text-yomu-foreground">Terverifikasi</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* About / Visi Misi Section */}
                <section id="tentang" className="bg-yomu-surface py-20 border-y border-yomu-border">
                    <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
                        <Gamepad2 className="h-16 w-16 text-yomu-accent mx-auto" />
                        <h2 className="text-3xl md:text-4xl font-serif font-bold text-yomu-foreground">Membangun Habituasi Literasi Digital</h2>
                        <div className="w-24 h-1 bg-yomu-primary mx-auto rounded-full"></div>
                        <p className="text-lg text-yomu-text-secondary leading-relaxed text-justify md:text-center">
                            Pengembangan aplikasi ini diharapkan dapat membangun habituasi bagi penggunanya untuk membaca teks secara saksama demi mendapatkan informasi yang akurat. Melalui implementasi perangkat lunak ini, kami berharap dapat menciptakan solusi digital yang mampu meningkatkan standar literasi informasi di Indonesia.
                        </p>
                    </div>
                </section>
            </main>

            {/* Footer & Watermark */}
            <footer className="bg-yomu-primary-dark text-white/80 py-12">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <BookOpen className="h-6 w-6 text-white" />
                        <span className="font-serif text-xl font-bold text-white">Yomu</span>
                    </div>
                    
                    <div className="text-center md:text-right">
                        <p className="text-sm">Hak Cipta &copy; {new Date().getFullYear()} Yomu Learning Platform.</p>
                        <p className="text-sm text-white/60 mt-2">
                            Developed with ❤️ by <span className="font-bold text-yomu-accent-light">Kelompok AdvPro-13</span>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}