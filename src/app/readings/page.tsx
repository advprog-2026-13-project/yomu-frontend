"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/services/api";
import { Reading, QuestionResponse, QuizSubmissionRequest } from "@/types";

export default function StudentReadingQuizPage() {
    const params = useParams();
    const router = useRouter();
    const readingId = params.id as string;

    // TODO: studentId harus didapat dari Context/Cookies Autentikasi
    const dummyStudentId = "student-123";

    const [mode, setMode] = useState<"READING" | "QUIZ" | "DONE">("READING");
    const [reading, setReading] = useState<Reading | null>(null);
    const [questions, setQuestions] = useState<QuestionResponse[]>([]);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [score, setScore] = useState<number | null>(null);

    useEffect(() => {
        api.getReadingDetail(readingId, dummyStudentId)
            .then(data => setReading(data))
            .catch(err => {
                alert("Kamu sudah mengerjakan kuis ini atau bacaan tidak ditemukan!");
                router.push('/student/readings');
            });
    }, [readingId]);

    const handleStartQuiz = async () => {
        try {
            const qs = await api.getQuestions(readingId, dummyStudentId);
            setQuestions(qs);
            setMode("QUIZ"); // <-- Teks bacaan akan hilang dari UI saat state ini berubah
        } catch (error) {
            alert("Gagal memuat soal.");
        }
    };

    const handleOptionSelect = (questionId: string, selectedOption: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: selectedOption }));
    };

    const handleSubmitQuiz = async () => {
        const payload: QuizSubmissionRequest = {
            studentId: dummyStudentId,
            answers: Object.entries(answers).map(([qId, ans]) => ({
                questionId: qId,
                selectedAnswer: ans
            }))
        };

        try {
            const result = await api.submitQuiz(readingId, payload);
            setScore(result.score);
            setMode("DONE");
        } catch (error) {
            alert("Gagal mengirim kuis!");
        }
    };

    if (!reading && mode === "READING") return <p>Loading...</p>;

    return (
        <div className="max-w-3xl mx-auto p-6">

            {/* --- MODE MEMBACA --- */}
            {mode === "READING" && (
                <div className="space-y-6">
                    <h1 className="text-3xl font-bold">{reading?.title}</h1>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
            {reading?.category}
          </span>
                    <div className="prose mt-4">{reading?.content}</div>

                    <button
                        onClick={handleStartQuiz}
                        className="mt-8 bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
                    >
                        Mulai Kuis
                    </button>
                    <p className="text-sm text-red-500 mt-2">
                        Peringatan: Teks tidak dapat dilihat kembali setelah kuis dimulai!
                    </p>
                </div>
            )}

            {/* --- MODE KUIS --- */}
            {mode === "QUIZ" && (
                <div className="space-y-8">
                    <h2 className="text-2xl font-bold">Kuis: {reading?.title}</h2>

                    {questions.map((q, index) => (
                        <div key={q.questionId} className="border p-4 rounded-lg shadow-sm">
                            <p className="font-semibold mb-4">{index + 1}. {q.questionText}</p>
                            <div className="space-y-2">
                                {q.options.map((opt: string) => (
                                    <label key={opt} className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name={q.questionId}
                                            value={opt}
                                            checked={answers[q.questionId] === opt}
                                            onChange={() => handleOptionSelect(q.questionId, opt)}
                                            className="form-radio h-5 w-5 text-indigo-600"
                                        />
                                        <span>{opt}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={handleSubmitQuiz}
                        disabled={Object.keys(answers).length !== questions.length}
                        className="w-full bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 disabled:bg-gray-400"
                    >
                        Submit Jawaban
                    </button>
                </div>
            )}

            {/* --- MODE SELESAI --- */}
            {mode === "DONE" && (
                <div className="text-center space-y-4 py-12">
                    <h2 className="text-3xl font-bold text-green-600">Kuis Selesai!</h2>
                    <p className="text-xl">Skor kamu: <span className="font-bold">{score} / 100</span></p>
                    <button
                        onClick={() => router.push('/student/readings')}
                        className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
                    >
                        Kembali ke Daftar Bacaan
                    </button>
                </div>
            )}
        </div>
    );
}