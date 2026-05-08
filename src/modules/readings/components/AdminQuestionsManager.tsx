"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";
import {Question} from "@/types/quiz";

interface AdminQuestionsManagerProps {
    readingId: string;
}

export default function AdminQuestionsManager({ readingId }: AdminQuestionsManagerProps) {
    const router = useRouter();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // State untuk form tambah soal
    const [questionText, setQuestionText] = useState("");
    const [options, setOptions] = useState(["", "", "", ""]);
    const [correctAnswer, setCorrectAnswer] = useState("");

    useEffect(() => {
        fetchQuestions();
    }, [readingId]);

    const fetchQuestions = async () => {
        try {
            setIsLoading(true);
            const data = await api.getAdminQuestions(readingId);
            setQuestions(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!correctAnswer) {
            alert("Pilih salah satu jawaban yang benar!");
            return;
        }

        try {
            setIsLoading(true);
            const payload = { questionText, options, correctAnswer };
            await api.createQuestion(readingId, payload);

            // Reset form setelah sukses
            setQuestionText("");
            setOptions(["", "", "", ""]);
            setCorrectAnswer("");
            alert("Soal berhasil ditambahkan!");

            // Ambil ulang data soal
            fetchQuestions();
        } catch (error) {
            alert("Gagal menambahkan soal.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (questionId: string) => {
        if (!window.confirm("Hapus soal ini?")) return;
        try {
            await api.deleteQuestion(readingId, questionId);
            setQuestions(prev => prev.filter(q => q.questionId !== questionId));
        } catch (error) {
            alert("Gagal menghapus soal");
        }
    };

    const updateOption = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    return (
        <div className="space-y-8">
            <button onClick={() => router.push('/admin/readings')} className="text-indigo-600 hover:underline mb-4 block">
                &larr; Kembali ke Daftar Bacaan
            </button>

            {/* Form Tambah Soal */}
            <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-indigo-500">
                <h2 className="text-xl font-bold mb-4">Tambah Soal Baru</h2>
                <form onSubmit={handleAddQuestion} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Pertanyaan</label>
                        <textarea required rows={3} value={questionText} onChange={(e) => setQuestionText(e.target.value)}
                                  className="mt-1 w-full border border-gray-300 rounded-md p-2" placeholder="Tulis soal di sini..." />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Pilihan Jawaban (Pilih radio button untuk jawaban benar)</label>
                        {options.map((opt, idx) => (
                            <div key={idx} className="flex items-center space-x-3">
                                <input type="radio" name="correctAnswer" required checked={correctAnswer === opt && opt !== ""}
                                       onChange={() => setCorrectAnswer(opt)} className="h-4 w-4 text-indigo-600" />
                                <input type="text" required value={opt} onChange={(e) => updateOption(idx, e.target.value)}
                                       className="flex-1 border border-gray-300 rounded-md p-2 text-sm" placeholder={`Opsi ${idx + 1}`} />
                            </div>
                        ))}
                    </div>

                    <button type="submit" disabled={isLoading} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                        {isLoading ? "Menyimpan..." : "Simpan Soal"}
                    </button>
                </form>
            </div>

            {/* Daftar Soal yang Sudah Ada */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">Daftar Soal ({questions.length})</h2>
                {questions.length === 0 ? (
                    <p className="text-gray-500">Belum ada soal untuk bacaan ini.</p>
                ) : (
                    <div className="space-y-4">
                        {questions.map((q, idx) => (
                            <div key={q.questionId} className="p-4 border border-gray-200 rounded-md bg-gray-50 relative">
                                <p className="font-semibold text-gray-800">{idx + 1}. {q.questionText}</p>
                                <ul className="mt-2 ml-4 list-disc space-y-1 text-sm">
                                    {q.options.map((opt: string, i: number) => (
                                        <li key={i} className={opt === q.correctAnswer ? "text-green-600 font-bold" : "text-gray-600"}>
                                            {opt} {opt === q.correctAnswer && " (Jawaban Benar)"}
                                        </li>
                                    ))}
                                </ul>
                                <button onClick={() => handleDelete(q.questionId)}
                                        className="absolute top-4 right-4 text-red-500 hover:text-red-700 text-sm font-medium">Hapus</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}