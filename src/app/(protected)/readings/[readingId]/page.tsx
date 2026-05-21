"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, AlertTriangle, HelpCircle, Loader2, Edit } from "lucide-react";
import Link from "next/link";
import { useReadingDetails, useSubmitQuiz, useCompleteReading } from "@/src/modules/readings/hooks";
import { useAuth } from "@/src/modules/auth";

export default function ReadingDetailPage({ params }: { params: Promise<{ readingId: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const { user } = useAuth();
    const { reading, questions, loading, error } = useReadingDetails(resolvedParams.readingId);
    const { submit, loading: submitLoading, error: submitError } = useSubmitQuiz();
    const { complete, loading: completeLoading, error: completeError } = useCompleteReading();

    // Answer submissions
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [quizResult, setQuizResult] = useState<{ score: number } | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleOptionSelect = (questionId: string, option: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: option }));
    };

    const handleSubmit = async () => {
        setActionError(null);
        if (Object.keys(answers).length < questions.length) {
            alert("Harap jawab semua pertanyaan sebelum mengumpulkan!");
            return;
        }

        const payload = {
            answers: Object.entries(answers).map(([questionId, selectedAnswer]) => ({
                questionId,
                selectedAnswer,
            }))
        };

        try {
            const result = await submit(resolvedParams.readingId, payload);
            if (result) {
                setQuizResult(result);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                setActionError("Gagal mengirim jawaban kuis. Anda mungkin sudah menyelesaikan kuis ini.");
            }
        } catch (err) {
            setActionError("Terjadi kesalahan saat mengumpulkan kuis.");
        }
    };

    const handleComplete = async () => {
        setActionError(null);
        const success = await complete(resolvedParams.readingId);
        if (success) {
            setQuizResult({ score: 100 });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            setActionError("Gagal menyelesaikan bacaan. Anda mungkin sudah pernah menyelesaikan materi ini.");
        }
    };

    if (!mounted) {
        return (
            <div className="yomu-page-container flex justify-center items-center py-20">
                <div className="flex flex-col items-center space-y-3">
                    <div className="w-10 h-10 border-4 border-yomu-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-yomu-text-secondary font-medium">Memuat materi...</p>
                </div>
            </div>
        );
    }

    const isAdmin = user?.role === "ADMIN";
    const isAlreadyAttempted = error?.message?.includes("404") || error?.message?.includes("attempt") || submitError?.message?.includes("attempt") || completeError?.message?.includes("attempt");

    if (error || !reading) {
        return (
            <div className="yomu-page-container max-w-3xl mx-auto px-4 py-8 space-y-6">
                <div className="yomu-card p-6 border-yomu-destructive/30 bg-yomu-destructive/5 text-yomu-destructive space-y-3">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="text-yomu-destructive" size={24} />
                        <h2 className="text-lg font-bold">Materi Tidak Dapat Diakses</h2>
                    </div>
                    {isAlreadyAttempted ? (
                        <p className="text-sm text-yomu-destructive/90 font-medium">
                            Anda sudah pernah menyelesaikan kuis/materi ini sebelumnya. Setiap kuis hanya dapat dikerjakan satu kali.
                        </p>
                    ) : (
                        <p className="text-sm text-yomu-destructive/90">
                            Gagal memuat materi: {error?.message || "Materi tidak ditemukan atau telah dihapus."}
                        </p>
                    )}
                </div>
                <Link href="/readings" className="inline-flex items-center gap-2 text-sm font-semibold text-yomu-primary hover:text-yomu-primary-dark transition-colors">
                    <ArrowLeft size={16} />
                    Kembali ke Katalog Bacaan
                </Link>
            </div>
        );
    }

    return (
        <div className="yomu-page-container flex flex-col max-w-3xl mx-auto space-y-8 px-4 py-8">
            {/* Top Bar Navigation */}
            <div className="flex justify-between items-center border-b border-yomu-border pb-4">
                <Link href="/readings" className="inline-flex items-center text-sm font-semibold text-yomu-text-secondary hover:text-yomu-primary transition-colors">
                    <ArrowLeft size={16} className="mr-2" />
                    Kembali ke Katalog
                </Link>

                {isAdmin && (
                    <Link
                        href="/admin/readings"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-yomu-primary/10 hover:bg-yomu-primary/20 text-yomu-primary rounded-xl text-xs font-bold transition-all cursor-pointer border border-yomu-primary/20"
                    >
                        <Edit size={14} />
                        Kelola Soal & Konten
                    </Link>
                )}
            </div>

            {/* ACTION ERROR ALERT */}
            {actionError && (
                <div className="yomu-card p-4 border-yomu-destructive/30 bg-yomu-destructive/5 text-yomu-destructive text-sm font-semibold flex items-center gap-2">
                    <AlertTriangle size={18} />
                    {actionError}
                </div>
            )}

            {/* QUIZ COMPLETION SUMMARY OR PREVIOUSLY COMPLETED BANNER */}
            {(quizResult || reading.completed) && (
                <div className="yomu-card p-8 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 text-center space-y-5 shadow-sm rounded-2xl">
                    <div className="flex justify-center text-green-600">
                        <CheckCircle2 size={56} className="animate-pulse text-green-500" />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold text-green-800 font-heading">
                            {quizResult ? "Luar Biasa!" : "Aktivitas Selesai"}
                        </h2>
                        <p className="text-sm text-green-700/90 font-medium">
                            {quizResult 
                                ? "Anda telah berhasil menyelesaikan aktivitas membaca materi ini." 
                                : "Anda sudah pernah menyelesaikan kuis/materi ini sebelumnya. Setiap kuis hanya dapat dikerjakan satu kali."}
                        </p>
                    </div>
                    
                    {quizResult && quizResult.score !== undefined && questions.length > 0 && (
                        <div className="inline-block bg-white border border-green-200 rounded-2xl p-4 px-8 shadow-inner">
                            <span className="text-xs font-semibold text-yomu-text-secondary block uppercase tracking-wider">Skor Kuis Anda</span>
                            <span className="text-4xl font-extrabold text-green-600 leading-none">{quizResult.score.toFixed(1)}</span>
                            <span className="text-sm text-yomu-text-secondary font-bold"> / 100</span>
                        </div>
                    )}

                    <div className="pt-2">
                        <button
                            onClick={() => router.push('/readings')}
                            className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm shadow-md shadow-green-600/10 transition-colors cursor-pointer"
                        >
                            Kembali ke Katalog
                        </button>
                    </div>
                </div>
            )}

            {/* READING CONTENT ARTICLE */}
            <article className="yomu-card p-8 md:p-10 space-y-6 shadow-sm border border-yomu-border bg-yomu-surface rounded-2xl">
                <div className="border-b border-yomu-border pb-6 space-y-2">
                    <h1 className="text-2xl md:text-4xl font-extrabold text-yomu-foreground font-serif leading-tight">{reading.title}</h1>
                    <div className="flex items-center justify-between text-xs font-medium text-yomu-text-secondary">
                        <span>Oleh: <strong className="text-yomu-foreground/80">{reading.author || "Tim Akademik Yomu"}</strong></span>
                        {reading.category && (
                            <span className="bg-yomu-primary-light text-yomu-primary px-2.5 py-1 rounded-full uppercase tracking-wider font-bold">
                                {reading.category}
                            </span>
                        )}
                    </div>
                </div>
                <div 
                    className="prose prose-slate max-w-none text-yomu-foreground leading-relaxed font-sans prose-headings:font-heading" 
                    dangerouslySetInnerHTML={{ __html: reading.content }} 
                />
            </article>

            {/* INTERACTIVE QUIZ SECTION */}
            {!quizResult && !reading.completed && questions.length > 0 && (
                <div className="space-y-6">
                    <div className="flex items-center gap-2 border-b border-yomu-border pb-2">
                        <HelpCircle size={22} className="text-yomu-primary" />
                        <h2 className="text-xl font-bold text-yomu-foreground font-heading">Kuis Evaluasi Pemahaman</h2>
                    </div>

                    {questions.map((q, index) => (
                        <div key={q.questionId} className="yomu-card p-6 space-y-4 border border-yomu-border bg-yomu-surface rounded-2xl shadow-sm">
                            <p className="font-semibold text-yomu-foreground text-base">
                                <span className="text-yomu-primary mr-1.5 font-bold">{index + 1}.</span>
                                {q.questionText}
                            </p>
                            <div className="grid grid-cols-1 gap-2.5 pl-4">
                                {q.options.map((opt, i) => {
                                    const isSelected = answers[q.questionId] === opt;
                                    return (
                                        <label
                                            key={i}
                                            className={`flex items-center p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-150 ${
                                                isSelected
                                                ? "border-yomu-primary bg-yomu-primary-light/40 shadow-inner"
                                                : "border-yomu-border hover:border-yomu-primary/30 hover:bg-gray-50/50"
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name={`question-${q.questionId}`}
                                                value={opt}
                                                checked={isSelected}
                                                onChange={() => handleOptionSelect(q.questionId, opt)}
                                                className="hidden"
                                            />
                                            <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center transition-colors ${
                                                isSelected ? "border-yomu-primary bg-yomu-primary-light" : "border-gray-300"
                                            }`}>
                                                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-yomu-primary animate-scale" />}
                                            </div>
                                            <span className="text-sm font-medium text-yomu-foreground">{opt}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    <div className="flex justify-end pt-4">
                        <button
                            onClick={handleSubmit}
                            disabled={submitLoading}
                            className="px-8 py-3 bg-yomu-primary text-white rounded-xl font-bold hover:bg-yomu-primary-dark transition-all transform hover:-translate-y-0.5 shadow-lg shadow-yomu-primary/20 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                        >
                            {submitLoading && <Loader2 className="animate-spin" size={18} />}
                            {submitLoading ? "Mengumpulkan..." : "Kumpulkan Kuis"}
                        </button>
                    </div>
                </div>
            )}

            {/* COMPLETION BUTTON IF NO QUESTIONS */}
            {!quizResult && !reading.completed && questions.length === 0 && !loading && (
                <div className="flex justify-center pt-4">
                    <button
                        onClick={handleComplete}
                        disabled={completeLoading}
                        className="px-8 py-3.5 bg-yomu-primary text-white rounded-xl font-bold hover:bg-yomu-primary-dark transition-all transform hover:-translate-y-0.5 shadow-lg shadow-yomu-primary/20 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                    >
                        {completeLoading && <Loader2 className="animate-spin" size={18} />}
                        Selesai Membaca & Tandai Selesai
                    </button>
                </div>
            )}
        </div>
    );
}
