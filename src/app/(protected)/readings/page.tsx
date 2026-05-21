"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Search, Sparkles, CheckCircle2, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useReadings } from "@/src/modules/readings/hooks";
import { useAuth } from "@/src/modules/auth";

export default function ReadingsPage() {
    const [mounted, setMounted] = useState(false);
    const { user } = useAuth();
    const { readings, loading, error } = useReadings();
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCurrentPage(1);
    }, [searchQuery]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="yomu-page-container flex justify-center items-center py-20">
                <div className="flex flex-col items-center space-y-3">
                    <div className="w-10 h-10 border-4 border-yomu-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-yomu-text-secondary font-medium">Memuat katalog...</p>
                </div>
            </div>
        );
    }

    const isAdmin = user?.role === "ADMIN";

    // Filter readings based on search query
    const filteredReadings = readings.filter(reading => 
        reading.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (reading.author && reading.author.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Pagination calculations (max 12 items per page)
    const ITEMS_PER_PAGE = 12;
    const totalPages = Math.ceil(filteredReadings.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredReadings.length);
    const paginatedReadings = filteredReadings.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
        <div className="yomu-page-container flex flex-col space-y-10 max-w-7xl mx-auto px-4 py-8">
            {/* Header Banner */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-yomu-primary to-yomu-primary-dark p-8 md:p-12 text-white shadow-xl shadow-yomu-primary/10">
                <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 transform -translate-x-12 translate-y-12 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10 space-y-4 max-w-2xl">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-white/90 uppercase tracking-wider backdrop-blur-md">
                        <Sparkles size={12} className="text-yomu-accent" />
                        Pustaka Pembelajaran
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold font-serif leading-tight">Perkaya Pengetahuan Tanpa Batas</h1>
                    <p className="text-white/80 text-sm md:text-base font-medium">
                        Pilih artikel dari berbagai topik akademik, pahami materinya secara mendalam, dan selesaikan kuis interaktifnya untuk memperkuat pemahaman Anda!
                    </p>
                </div>
            </div>

            {/* Admin Dashboard Entry Banner */}
            {isAdmin && (
                <div className="bg-yomu-primary-light/30 border border-yomu-primary/20 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h2 className="text-base font-bold text-yomu-primary-dark flex items-center gap-2">
                            👑 Panel Konten Admin Aktif
                        </h2>
                        <p className="text-xs text-yomu-text-secondary">
                            Sebagai admin, Anda dapat menambah materi bacaan baru, menyembunyikan/menampilkan materi, mengedit konten, serta merancang soal kuis.
                        </p>
                    </div>
                    <Link
                        href="/admin/readings"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-yomu-primary text-white rounded-xl text-sm font-semibold hover:bg-yomu-primary-dark transition-all transform hover:-translate-y-0.5 shadow-md shadow-yomu-primary/10 cursor-pointer self-start md:self-auto"
                    >
                        Buka Manajemen Bacaan
                        <ArrowRight size={16} />
                    </Link>
                </div>
            )}

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-yomu-text-secondary" size={18} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari materi berdasarkan judul atau penulis..."
                        className="w-full pl-10 pr-4 py-2.5 border border-yomu-border rounded-xl focus:outline-yomu-primary bg-yomu-surface text-sm font-medium"
                    />
                </div>
                
                <div className="text-xs text-yomu-text-secondary font-semibold">
                    Menampilkan {filteredReadings.length > 0 ? startIndex + 1 : 0}-{endIndex} dari {filteredReadings.length} hasil (Total: {readings.length} materi)
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="yomu-card p-4 border-yomu-destructive/50 bg-yomu-destructive/10 text-yomu-destructive">
                    <p>Gagal memuat materi bacaan: {error.message}</p>
                </div>
            )}

            {/* Readings Grid */}
            {!loading && !error && filteredReadings.length === 0 && (
                <div className="yomu-card p-16 text-center border-dashed border-2 flex flex-col items-center justify-center space-y-4">
                    <BookOpen size={48} className="text-yomu-text-secondary" />
                    <p className="text-yomu-text-secondary font-medium">Tidak ada materi bacaan yang cocok dengan pencarian Anda.</p>
                </div>
            )}

            {!loading && !error && filteredReadings.length > 0 && (
                <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginatedReadings.map((reading) => (
                            <Link key={reading.readingId} href={`/readings/${reading.readingId}`}>
                                <div className="yomu-card p-6 flex flex-col h-full hover:shadow-lg transition-all cursor-pointer border border-yomu-border hover:border-yomu-primary/30 group bg-yomu-surface">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 bg-yomu-primary-light rounded-2xl flex items-center justify-center text-yomu-primary group-hover:scale-110 transition-transform shadow-inner">
                                            <BookOpen size={24} />
                                        </div>
                                        {reading.completed && (
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                                                <CheckCircle2 size={12} className="text-green-600" />
                                                Selesai dibaca
                                            </div>
                                        )}
                                    </div>
                                    
                                    <h2 className="text-lg font-bold text-yomu-foreground mb-1 line-clamp-2 group-hover:text-yomu-primary transition-colors font-heading leading-snug">
                                        {reading.title}
                                    </h2>
                                    <p className="text-xs text-yomu-text-secondary mb-4">
                                        Oleh <span className="font-semibold text-yomu-foreground/80">{reading.author || "Tim Akademik Yomu"}</span>
                                    </p>
                                    
                                    <div 
                                        className="text-xs text-yomu-text-secondary/90 line-clamp-3 mb-6 prose prose-xs leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: reading.content.replace(/<[^>]*>/g, '').substring(0, 120) + "..." }}
                                    />
                                    
                                    <div className="mt-auto pt-4 border-t border-yomu-border flex items-center justify-between text-xs font-semibold">
                                        <span className={reading.completed ? "text-green-600" : "text-yomu-primary group-hover:text-yomu-primary-dark"}>
                                            {reading.completed ? "Tinjau Ulang" : "Mulai Membaca"}
                                        </span>
                                        <ArrowRight size={14} className={`transform transition-transform ${reading.completed ? "text-green-600 group-hover:translate-x-1" : "text-yomu-primary group-hover:translate-x-1"}`} />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 pt-6 border-t border-yomu-border">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 px-4 rounded-xl border-2 border-yomu-border text-yomu-foreground bg-yomu-surface disabled:opacity-40 disabled:cursor-not-allowed hover:bg-yomu-primary-light hover:border-yomu-primary/30 hover:text-yomu-primary font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                            >
                                <ChevronLeft size={14} />
                                Sebelumnya
                            </button>

                            <div className="flex gap-1.5">
                                {Array.from({ length: totalPages }, (_, i) => {
                                    const pageNum = i + 1;
                                    const isActive = pageNum === currentPage;
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all cursor-pointer border-2 ${
                                                isActive
                                                ? "bg-yomu-primary border-yomu-primary text-white shadow-md shadow-yomu-primary/20"
                                                : "bg-yomu-surface border-yomu-border text-yomu-text-secondary hover:border-yomu-primary/30 hover:text-yomu-primary"
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-2 px-4 rounded-xl border-2 border-yomu-border text-yomu-foreground bg-yomu-surface disabled:opacity-40 disabled:cursor-not-allowed hover:bg-yomu-primary-light hover:border-yomu-primary/30 hover:text-yomu-primary font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                            >
                                Berikutnya
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
