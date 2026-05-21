"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Plus, Edit, Trash2, Eye, EyeOff, HelpCircle, Loader2, X } from "lucide-react";
import { useAdminReadings, useAdminActions } from "@/src/modules/readings/hooks";
import * as api from "@/src/modules/readings/api";
import { useAuth } from "@/src/modules/auth";
import type { Reading, QuestionResponse } from "@/src/modules/readings/types";

export default function AdminReadingsPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { readings, loading, error, refresh } = useAdminReadings();
    const { 
        createReading, 
        updateReading, 
        deleteReading, 
        hideReading, 
        unhideReading,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        loading: actionLoading 
    } = useAdminActions();

    // Modals & Panels State
    const [activeModal, setActiveModal] = useState<"create" | "edit" | "questions" | null>(null);
    const [selectedReading, setSelectedReading] = useState<Reading | null>(null);

    // Reading Form State
    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [content, setContent] = useState("");

    // Question Management State
    const [activeQuestions, setActiveQuestions] = useState<QuestionResponse[]>([]);
    const [questionsLoading, setQuestionsLoading] = useState(false);
    const [questionText, setQuestionText] = useState("");
    const [options, setOptions] = useState<string[]>(["", "", "", ""]);
    const [correctAnswer, setCorrectAnswer] = useState("");
    const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

    useEffect(() => {
        if (user && user.role !== "ADMIN") {
            router.replace("/dashboard");
        }
    }, [user, router]);

    // Handle open modals
    const openCreateModal = () => {
        setTitle("");
        setAuthor("");
        setContent("");
        setActiveModal("create");
    };

    const openEditModal = (reading: Reading) => {
        setSelectedReading(reading);
        setTitle(reading.title);
        setAuthor(reading.author || "");
        setContent(reading.content);
        setActiveModal("edit");
    };

    const openQuestionsModal = async (reading: Reading) => {
        setSelectedReading(reading);
        setActiveModal("questions");
        setQuestionsLoading(true);
        // Clear question form
        setQuestionText("");
        setOptions(["", "", "", ""]);
        setCorrectAnswer("");
        setEditingQuestionId(null);
        try {
            const data = await api.fetchReadingQuestions(reading.readingId);
            setActiveQuestions(data);
        } catch (err) {
            console.error("Gagal memuat pertanyaan:", err);
            alert("Gagal memuat pertanyaan kuis.");
        } finally {
            setQuestionsLoading(false);
        }
    };

    // Reading handlers
    const handleCreateReading = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !author || !content) {
            alert("Harap isi semua kolom!");
            return;
        }
        const result = await createReading({ title, content, author });
        if (result) {
            alert("Materi bacaan berhasil dibuat!");
            setActiveModal(null);
            refresh();
        }
    };

    const handleUpdateReading = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedReading) return;
        if (!title || !author || !content) {
            alert("Harap isi semua kolom!");
            return;
        }
        const result = await updateReading(selectedReading.readingId, { title, content, author });
        if (result) {
            alert("Materi bacaan berhasil diperbarui!");
            setActiveModal(null);
            refresh();
        }
    };

    const handleDeleteReading = async (id: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus materi ini beserta kuisnya?")) return;
        const success = await deleteReading(id);
        if (success) {
            alert("Materi bacaan berhasil dihapus!");
            refresh();
        }
    };

    const handleToggleVisibility = async (reading: Reading) => {
        let success = false;
        if (reading.hidden) {
            success = await unhideReading(reading.readingId);
        } else {
            success = await hideReading(reading.readingId);
        }
        if (success) {
            refresh();
        }
    };

    // Question handlers
    const handleSaveQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedReading) return;
        if (!questionText || options.some(opt => !opt) || !correctAnswer) {
            alert("Harap isi semua kolom pertanyaan dan jawaban!");
            return;
        }

        if (!options.includes(correctAnswer)) {
            alert("Jawaban benar harus sama persis dengan salah satu dari 4 opsi pilihan!");
            return;
        }

        if (editingQuestionId) {
            // Update question
            const success = await updateQuestion(editingQuestionId, {
                questionText,
                options,
                correctAnswer
            });
            if (success) {
                alert("Pertanyaan berhasil diperbarui!");
                // Reset form
                setQuestionText("");
                setOptions(["", "", "", ""]);
                setCorrectAnswer("");
                setEditingQuestionId(null);
                // Reload questions
                const data = await api.fetchReadingQuestions(selectedReading.readingId);
                setActiveQuestions(data);
            }
        } else {
            // Create question
            const success = await addQuestion(selectedReading.readingId, {
                questionText,
                options,
                correctAnswer
            });
            if (success) {
                alert("Pertanyaan baru berhasil ditambahkan!");
                // Reset form
                setQuestionText("");
                setOptions(["", "", "", ""]);
                setCorrectAnswer("");
                // Reload questions
                const data = await api.fetchReadingQuestions(selectedReading.readingId);
                setActiveQuestions(data);
            }
        }
    };

    const handleEditQuestionClick = (q: QuestionResponse) => {
        setEditingQuestionId(q.questionId);
        setQuestionText(q.questionText);
        setOptions([...q.options]);
        setCorrectAnswer(q.correctAnswer || "");
    };

    const handleDeleteQuestionClick = async (questionId: string) => {
        if (!selectedReading) return;
        if (!confirm("Apakah Anda yakin ingin menghapus pertanyaan ini?")) return;
        const success = await deleteQuestion(questionId);
        if (success) {
            alert("Pertanyaan berhasil dihapus!");
            const data = await api.fetchReadingQuestions(selectedReading.readingId);
            setActiveQuestions(data);
        }
    };

    if (user && user.role !== "ADMIN") return null;

    return (
        <div className="yomu-page-container flex flex-col space-y-8 max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-yomu-border pb-6">
                <div>
                    <h1 className="yomu-heading-1 font-bold text-yomu-primary-dark">Manajemen Materi Bacaan</h1>
                    <p className="yomu-text-muted">Kelola perpustakaan bacaan, sembunyikan materi, dan atur kuis untuk siswa.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-yomu-primary text-white rounded-xl font-semibold shadow-lg shadow-yomu-primary/20 hover:bg-yomu-primary-dark transition-all transform hover:-translate-y-0.5 cursor-pointer self-start md:self-auto"
                >
                    <Plus size={20} />
                    Tambah Bacaan
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col justify-center items-center p-12 space-y-4">
                    <Loader2 className="animate-spin text-yomu-primary" size={40} />
                    <p className="text-yomu-text-secondary animate-pulse">Memuat semua materi...</p>
                </div>
            ) : error ? (
                <div className="yomu-card p-4 border-yomu-destructive/50 bg-yomu-destructive/10 text-yomu-destructive">
                    <p>Gagal memuat materi: {error.message}</p>
                </div>
            ) : readings.length === 0 ? (
                <div className="yomu-card p-12 text-center border-dashed border-2 flex flex-col items-center justify-center space-y-4">
                    <BookOpen size={48} className="text-yomu-text-secondary" />
                    <p className="text-yomu-text-secondary font-medium">Belum ada materi bacaan yang dibuat.</p>
                    <button
                        onClick={openCreateModal}
                        className="px-4 py-2 bg-yomu-primary text-white rounded-lg hover:bg-yomu-primary-dark transition-colors"
                    >
                        Mulai Buat Materi Pertama
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {readings.map((reading) => (
                        <div 
                            key={reading.readingId} 
                            className={`yomu-card p-6 flex flex-col h-full border hover:shadow-md transition-shadow relative overflow-hidden ${
                                reading.hidden ? "border-dashed border-gray-300 bg-gray-50/50" : "border-yomu-border"
                            }`}
                        >
                            {reading.hidden && (
                                <div className="absolute top-0 right-0 bg-gray-400 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                                    Tersembunyi
                                </div>
                            )}
                            <div className="w-12 h-12 bg-yomu-primary-light rounded-full flex items-center justify-center text-yomu-primary mb-4">
                                <BookOpen size={24} />
                            </div>
                            <h2 className="yomu-heading-3 font-semibold mb-1 line-clamp-2 pr-12">{reading.title}</h2>
                            <p className="text-xs text-yomu-text-secondary mb-4">Oleh {reading.author || "Tim Akademik Yomu"}</p>

                            <div 
                                className="text-sm text-yomu-text-secondary line-clamp-3 mb-6 prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ __html: reading.content.replace(/<[^>]*>/g, '').substring(0, 150) + "..." }}
                            />

                            <div className="mt-auto pt-4 border-t border-yomu-border flex flex-wrap gap-2">
                                <button
                                    onClick={() => openEditModal(reading)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 border border-yomu-border hover:border-yomu-primary hover:text-yomu-primary text-xs font-medium rounded-lg transition-colors cursor-pointer"
                                    title="Edit Konten"
                                >
                                    <Edit size={14} />
                                    Edit
                                </button>
                                <button
                                    onClick={() => openQuestionsModal(reading)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 border border-yomu-border hover:border-yomu-primary hover:text-yomu-primary text-xs font-medium rounded-lg transition-colors cursor-pointer bg-yomu-primary-light/10 text-yomu-primary"
                                    title="Kelola Kuis"
                                >
                                    <HelpCircle size={14} />
                                    Kelola Soal
                                </button>
                                <button
                                    onClick={() => handleToggleVisibility(reading)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 border text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                                        reading.hidden 
                                        ? "border-green-200 hover:bg-green-50 text-green-700" 
                                        : "border-gray-200 hover:bg-gray-100 text-gray-700"
                                    }`}
                                    title={reading.hidden ? "Tampilkan untuk Siswa" : "Sembunyikan dari Siswa"}
                                >
                                    {reading.hidden ? <Eye size={14} /> : <EyeOff size={14} />}
                                    {reading.hidden ? "Unhide" : "Hide"}
                                </button>
                                <button
                                    onClick={() => handleDeleteReading(reading.readingId)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 border border-red-100 hover:bg-red-50 text-red-600 text-xs font-medium rounded-lg transition-colors cursor-pointer ml-auto"
                                    title="Hapus"
                                >
                                    <Trash2 size={14} />
                                    Hapus
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* CREATE / EDIT MATERIAL MODAL */}
            {(activeModal === "create" || activeModal === "edit") && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-yomu-surface rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="bg-yomu-primary p-6 text-white flex justify-between items-center">
                            <h2 className="text-xl font-bold font-heading">
                                {activeModal === "create" ? "Buat Materi Bacaan Baru" : "Edit Materi Bacaan"}
                            </h2>
                            <button 
                                onClick={() => setActiveModal(null)}
                                className="text-white/80 hover:text-white transition-colors cursor-pointer"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={activeModal === "create" ? handleCreateReading : handleUpdateReading} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-yomu-text-secondary mb-1">Judul Materi</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-yomu-border rounded-xl focus:outline-yomu-primary bg-yomu-surface text-yomu-foreground font-medium"
                                    placeholder="Contoh: Pengenalan Object Oriented Programming"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-yomu-text-secondary mb-1">Nama Penulis</label>
                                <input
                                    type="text"
                                    value={author}
                                    onChange={(e) => setAuthor(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-yomu-border rounded-xl focus:outline-yomu-primary bg-yomu-surface text-yomu-foreground font-medium"
                                    placeholder="Contoh: Prof. Budi Hartono"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-yomu-text-secondary mb-1">Isi Konten Materi (HTML / Text biasa)</label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-yomu-border rounded-xl focus:outline-yomu-primary bg-yomu-surface text-yomu-foreground min-h-[250px] font-normal font-sans"
                                    placeholder="Tulis atau paste isi konten bacaan lengkap di sini..."
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-yomu-border">
                                <button
                                    type="button"
                                    onClick={() => setActiveModal(null)}
                                    className="px-5 py-2.5 border border-yomu-border text-yomu-text-secondary rounded-xl hover:bg-gray-50 transition-colors font-medium cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="px-6 py-2.5 bg-yomu-primary text-white rounded-xl hover:bg-yomu-primary-dark transition-colors disabled:opacity-50 flex items-center gap-2 font-semibold shadow-md shadow-yomu-primary/10 cursor-pointer"
                                >
                                    {actionLoading && <Loader2 className="animate-spin" size={18} />}
                                    Simpan Perubahan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MANAGE QUESTIONS MODAL */}
            {activeModal === "questions" && selectedReading && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-yomu-surface rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
                        <div className="bg-yomu-primary p-6 text-white flex justify-between items-center flex-shrink-0">
                            <div>
                                <h2 className="text-xl font-bold font-heading">Kelola Soal Kuis</h2>
                                <p className="text-white/80 text-xs mt-0.5">Materi: {selectedReading.title}</p>
                            </div>
                            <button 
                                onClick={() => setActiveModal(null)}
                                className="text-white/80 hover:text-white transition-colors cursor-pointer"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-6">
                            {/* Question Form */}
                            <div className="w-full lg:w-5/12 border-b lg:border-b-0 lg:border-r border-yomu-border pb-6 lg:pb-0 lg:pr-6 flex flex-col">
                                <h3 className="text-base font-bold text-yomu-primary mb-4">
                                    {editingQuestionId ? "Edit Pertanyaan" : "Tambah Pertanyaan Baru"}
                                </h3>
                                <form onSubmit={handleSaveQuestion} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-yomu-text-secondary mb-1">Pertanyaan</label>
                                        <textarea
                                            value={questionText}
                                            onChange={(e) => setQuestionText(e.target.value)}
                                            className="w-full px-3 py-2 border border-yomu-border rounded-lg focus:outline-yomu-primary bg-yomu-surface text-sm"
                                            placeholder="Masukkan kalimat tanya..."
                                            rows={3}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-semibold text-yomu-text-secondary">Pilihan Jawaban</label>
                                        {options.map((opt, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-yomu-text-secondary w-4">
                                                    {String.fromCharCode(65 + idx)}.
                                                </span>
                                                <input
                                                    type="text"
                                                    value={opt}
                                                    onChange={(e) => {
                                                        const newOpts = [...options];
                                                        newOpts[idx] = e.target.value;
                                                        setOptions(newOpts);
                                                    }}
                                                    className="flex-1 px-3 py-1.5 border border-yomu-border rounded-lg focus:outline-yomu-primary bg-yomu-surface text-sm"
                                                    placeholder={`Opsi ${String.fromCharCode(65 + idx)}...`}
                                                    required
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-yomu-text-secondary mb-1">Jawaban Benar</label>
                                        <select
                                            value={correctAnswer}
                                            onChange={(e) => setCorrectAnswer(e.target.value)}
                                            className="w-full px-3 py-2 border border-yomu-border rounded-lg focus:outline-yomu-primary bg-yomu-surface text-sm font-medium"
                                            required
                                        >
                                            <option value="">-- Pilih Jawaban Benar --</option>
                                            {options.map((opt, idx) => (
                                                opt ? (
                                                    <option key={idx} value={opt}>
                                                        {String.fromCharCode(65 + idx)}. {opt}
                                                    </option>
                                                ) : null
                                            ))}
                                        </select>
                                        <p className="text-[10px] text-yomu-text-secondary mt-1">
                                            Catatan: Siswa tidak akan bisa melihat jawaban benar saat mengerjakan kuis.
                                        </p>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        {editingQuestionId && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingQuestionId(null);
                                                    setQuestionText("");
                                                    setOptions(["", "", "", ""]);
                                                    setCorrectAnswer("");
                                                }}
                                                className="flex-1 px-3 py-2 border border-yomu-border text-yomu-text-secondary rounded-lg hover:bg-gray-50 text-xs font-semibold cursor-pointer"
                                            >
                                                Batal Edit
                                            </button>
                                        )}
                                        <button
                                            type="submit"
                                            disabled={actionLoading}
                                            className="flex-1 px-4 py-2 bg-yomu-primary text-white rounded-lg hover:bg-yomu-primary-dark text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
                                        >
                                            {actionLoading && <Loader2 className="animate-spin" size={14} />}
                                            {editingQuestionId ? "Perbarui" : "Simpan Soal"}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Questions List */}
                            <div className="w-full lg:w-7/12 flex flex-col h-full">
                                <h3 className="text-base font-bold text-yomu-foreground mb-4 flex items-center justify-between">
                                    <span>Daftar Pertanyaan</span>
                                    <span className="text-xs font-semibold px-2 py-0.5 bg-yomu-primary-light text-yomu-primary rounded-full">
                                        {activeQuestions.length} Soal
                                    </span>
                                </h3>

                                {questionsLoading ? (
                                    <div className="flex flex-col justify-center items-center py-12 space-y-2">
                                        <Loader2 className="animate-spin text-yomu-primary" size={24} />
                                        <p className="text-xs text-yomu-text-secondary animate-pulse">Memuat soal...</p>
                                    </div>
                                ) : activeQuestions.length === 0 ? (
                                    <div className="border border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center space-y-2">
                                        <HelpCircle size={32} className="text-yomu-text-secondary" />
                                        <p className="text-xs text-yomu-text-secondary font-semibold">Belum ada pertanyaan kuis.</p>
                                        <p className="text-[10px] text-yomu-text-secondary">Jika kuis tidak diisi soal, siswa cukup menekan tombol &quot;Selesai Baca&quot; untuk merampungkan materi.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-1">
                                        {activeQuestions.map((q, qidx) => (
                                            <div key={q.questionId} className="border border-yomu-border rounded-xl p-4 bg-gray-50/50 space-y-3 relative group">
                                                <div className="flex items-start justify-between gap-4">
                                                    <p className="text-sm font-semibold pr-16">
                                                        <span className="text-yomu-primary mr-1.5">{qidx + 1}.</span>
                                                        {q.questionText}
                                                    </p>
                                                    <div className="flex gap-1.5 absolute top-3 right-3 opacity-80 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleEditQuestionClick(q)}
                                                            className="p-1 hover:bg-yomu-primary/10 text-yomu-primary rounded transition-colors cursor-pointer"
                                                            title="Edit Soal"
                                                        >
                                                            <Edit size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteQuestionClick(q.questionId)}
                                                            className="p-1 hover:bg-red-50 text-red-600 rounded transition-colors cursor-pointer"
                                                            title="Hapus Soal"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-4">
                                                    {q.options.map((opt, oidx) => {
                                                        const isCorrect = q.correctAnswer === opt;
                                                        return (
                                                            <div 
                                                                key={oidx} 
                                                                className={`text-xs p-1.5 px-2.5 rounded-md border flex items-center gap-1.5 ${
                                                                    isCorrect 
                                                                    ? "border-green-200 bg-green-50 text-green-800 font-medium" 
                                                                    : "border-gray-200 bg-white text-yomu-text-secondary"
                                                                }`}
                                                            >
                                                                <span>{String.fromCharCode(65 + oidx)}.</span>
                                                                <span>{opt}</span>
                                                                {isCorrect && <span className="text-[10px] bg-green-200 text-green-800 px-1 rounded ml-auto">Correct</span>}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
