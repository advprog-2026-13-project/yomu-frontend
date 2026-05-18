"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Clock, ChevronRight, PlayCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Mock Data structure mirroring the backend Reading model
interface Reading {
    id: string;
    title: string;
    author: string;
    category: string;
    difficultyLevel: string; // e.g. "Pemula", "Menengah", "Mahir"
    estimatedTimeMinutes: number;
    description: string;
    isCompleted?: boolean;
}

export default function ReadingsPage() {
    const [loading, setLoading] = useState(true);
    const [readings, setReadings] = useState<Reading[]>([]);

    useEffect(() => {
        setTimeout(() => {
            setReadings([
                {
                    id: "r1",
                    title: "Mendeteksi Bias dalam Berita",
                    author: "Yomu Editorial",
                    category: "Literasi Berita",
                    difficultyLevel: "Menengah",
                    estimatedTimeMinutes: 5,
                    description: "Setiap hari kita dibombardir oleh ribuan informasi. Pelajari bagaimana cara mengetahui apakah sebuah berita memiliki bias politik atau komersial.",
                    isCompleted: false,
                },
                {
                    id: "r2",
                    title: "Sejarah Literasi Digital di Era Modern",
                    author: "Dr. Aditya Pratama",
                    category: "Sejarah & Teknologi",
                    difficultyLevel: "Pemula",
                    estimatedTimeMinutes: 3,
                    description: "Memahami bagaimana literasi digital berevolusi dari era komputer awal hingga era kecerdasan buatan.",
                    isCompleted: true,
                },
                {
                    id: "r3",
                    title: "Membongkar Hoaks Kesehatan",
                    author: "Klinik Yomu",
                    category: "Kesehatan",
                    difficultyLevel: "Mahir",
                    estimatedTimeMinutes: 7,
                    description: "Banyak hoaks kesehatan yang beredar di grup obrolan. Mari pelajari kerangka berpikir kritis untuk menangkalnya.",
                    isCompleted: false,
                }
            ]);
            setLoading(false);
        }, 800);
    }, []);

    if (loading) {
        return <div className="flex min-h-[60vh] items-center justify-center p-4">Memuat daftar bacaan...</div>;
    }

    return (
        <div className="yomu-page-container">
            <div className="space-y-2">
                <h1 className="yomu-heading-1">
                    <BookOpen className="h-8 w-8 text-blue-700" />
                    Katalog Bacaan
                </h1>
                <p className="yomu-text-muted">Pilih artikel, baca materinya, dan selesaikan kuis interaktifnya!</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    {readings.map((reading) => (
                        <Card key={reading.id} className="yomu-card group overflow-hidden">
                            <div className="flex flex-col sm:flex-row">
                                {/* Thumbnail Placeholder */}
                                <div className="sm:w-48 bg-slate-100 flex-shrink-0 flex items-center justify-center p-6 border-b sm:border-b-0 sm:border-r border-blue-50">
                                    <BookOpen className={`h-12 w-12 ${reading.isCompleted ? 'text-emerald-300' : 'text-blue-200 group-hover:text-blue-400 transition-colors'}`} />
                                </div>
                                
                                <div className="flex-1 flex flex-col">
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="yomu-badge yomu-badge-category">
                                                        {reading.category}
                                                    </span>
                                                    <span className={`yomu-badge ${
                                                        reading.difficultyLevel === 'Pemula' ? 'yomu-badge-beginner' :
                                                        reading.difficultyLevel === 'Menengah' ? 'yomu-badge-intermediate' :
                                                        'yomu-badge-advanced'
                                                    }`}>
                                                        {reading.difficultyLevel}
                                                    </span>
                                                </div>
                                                <CardTitle className="text-xl font-serif text-blue-950 group-hover:text-blue-700 transition-colors">
                                                    {reading.title}
                                                </CardTitle>
                                                <CardDescription className="flex items-center gap-4 text-sm">
                                                    <span>Oleh {reading.author}</span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {reading.estimatedTimeMinutes} mnt
                                                    </span>
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="text-sm text-slate-600 flex-1">
                                        {reading.description}
                                    </CardContent>
                                    <CardFooter className="pt-0 justify-between items-center">
                                        {reading.isCompleted ? (
                                            <div className="text-sm font-medium text-emerald-600 flex items-center gap-1">
                                                <BookOpen className="h-4 w-4" />
                                                Selesai Dibaca
                                            </div>
                                        ) : (
                                            <div className="text-sm font-medium text-slate-400">
                                                Belum dibaca
                                            </div>
                                        )}
                                        <Button asChild className="yomu-btn-primary rounded-full pr-2">
                                            <Link href={`/readings/${reading.id}`}>
                                                {reading.isCompleted ? "Baca Ulang" : "Mulai Membaca"}
                                                <ChevronRight className="h-4 w-4 ml-1" />
                                            </Link>
                                        </Button>
                                    </CardFooter>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                <div className="space-y-6">
                    <Card className="yomu-card bg-blue-50/50">
                        <CardHeader>
                            <CardTitle className="font-serif text-lg text-blue-950">Lanjutkan Terakhir</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center py-6 text-center">
                            <PlayCircle className="h-12 w-12 text-blue-300 mb-3" />
                            <h3 className="font-medium text-blue-950">Mendeteksi Bias dalam Berita</h3>
                            <p className="text-sm text-slate-500 mb-4">Paragraf 3 / Kuis 1</p>
                            <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-100">
                                Lanjutkan
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="yomu-card">
                        <CardHeader>
                            <CardTitle className="font-serif text-lg text-blue-950">Statistik Bacaan</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="yomu-text-muted text-sm">Diselesaikan</span>
                                <span className="font-bold text-blue-950">12 Artikel</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="yomu-text-muted text-sm">Waktu Membaca</span>
                                <span className="font-bold text-blue-950">4.5 Jam</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="yomu-text-muted text-sm">Akurasi Kuis</span>
                                <span className="font-bold text-emerald-600">85%</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
