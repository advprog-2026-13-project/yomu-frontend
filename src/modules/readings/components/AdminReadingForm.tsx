"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";
import { Reading } from "@/types";

interface AdminReadingFormProps {
    initialData?: Reading;
    isEditMode?: boolean;
}

export default function AdminReadingForm({ initialData, isEditMode = false }: AdminReadingFormProps) {
    const router = useRouter();

    const [title, setTitle] = useState(initialData?.title || "");
    const [content, setContent] = useState(initialData?.content || "");
    const [category, setCategory] = useState(initialData?.category || "News & Media");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const payload = { title, content, category };

            if (isEditMode && initialData?.readingId) {
                await api.updateReading(initialData.readingId, payload);
                alert("Bacaan berhasil diperbarui!");
            } else {
                await api.createReading(payload);
                alert("Bacaan baru berhasil ditambahkan!");
            }

            router.push("/admin/readings");
            router.refresh();
        } catch (error) {
            console.error("Error menyimpan bacaan:", error);
            alert("Terjadi kesalahan saat menyimpan data ke server.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {isEditMode ? "Edit Bacaan" : "Buat Bacaan Baru"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Input Judul */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Judul Bacaan</label>
                    <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Masukkan judul..."
                    />
                </div>

                {/* Pilihan Kategori */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="News & Media">News & Media</option>
                        <option value="Olahraga">Olahraga</option>
                        <option value="Sains & Teknologi">Sains & Teknologi</option>
                        <option value="Sejarah">Sejarah</option>
                    </select>
                </div>

                {/* Input Konten Teks */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Konten Teks</label>
                    <textarea
                        required
                        rows={10}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Tulis isi bacaan di sini..."
                    />
                </div>

                {/* Tombol Aksi */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                        type="button"
                        onClick={() => router.push("/admin/readings")}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
                    >
                        {isLoading ? "Menyimpan..." : "Simpan Bacaan"}
                    </button>
                </div>
            </form>
        </div>
    );
}