"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/services/api";
import { Reading } from "@/types";

export default function AdminReadingsTable() {
    const [readings, setReadings] = useState<Reading[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        fetchReadings();
    }, []);

    const fetchReadings = async () => {
        try {
            setIsLoading(true);
            const data = await api.getAdminReadings();
            setReadings(data);
        } catch (error) {
            console.error("Gagal mengambil data bacaan:", error);
            alert("Gagal memuat daftar bacaan dari server.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (readingId: string) => {
        const confirmDelete = window.confirm("Apakah Anda yakin ingin menghapus bacaan ini beserta semua soalnya?");
        if (!confirmDelete) return;

        try {
            await api.deleteReading(readingId);

            setReadings((prev) => prev.filter((r) => r.readingId !== readingId));
            alert("Bacaan berhasil dihapus!");
        } catch (error) {
            console.error("Gagal menghapus bacaan:", error);
            alert("Terjadi kesalahan saat menghapus bacaan.");
        }
    };

    if (isLoading) {
        return <div className="text-center py-10">Memuat data...</div>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Daftar Bacaan</h2>
                {/* Tombol ini akan mengarahkan ke halaman form pembuatan bacaan baru */}
                <Link href="/admin/readings/create">
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded transition-colors">
                        + Tambah Bacaan
                    </button>
                </Link>
            </div>

            {readings.length === 0 ? (
                <p className="text-gray-500 text-center py-6">Belum ada bacaan yang ditambahkan.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                        <tr className="bg-gray-50 border-b-2 border-gray-200">
                            <th className="p-3 text-left text-sm font-semibold text-gray-600 tracking-wide">Judul</th>
                            <th className="p-3 text-left text-sm font-semibold text-gray-600 tracking-wide">Kategori</th>
                            <th className="p-3 text-center text-sm font-semibold text-gray-600 tracking-wide">Aksi</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {readings.map((reading) => (
                            <tr key={reading.readingId} className="hover:bg-gray-50 transition-colors">
                                <td className="p-3 text-sm text-gray-800">{reading.title}</td>
                                <td className="p-3 text-sm">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {reading.category}
                    </span>
                                </td>
                                <td className="p-3 text-sm text-center space-x-2">
                                    {/* Mengelola Soal Kuis */}
                                    <Link href={`/admin/readings/${reading.readingId}/questions`}>
                                        <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded text-xs transition-colors">
                                            Kelola Soal
                                        </button>
                                    </Link>

                                    {/* Mengedit Bacaan */}
                                    <Link href={`/admin/readings/${reading.readingId}/edit`}>
                                        <button className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded text-xs transition-colors">
                                            Edit
                                        </button>
                                    </Link>

                                    {/* Menghapus Bacaan */}
                                    <button
                                        onClick={() => handleDelete(reading.readingId)}
                                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded text-xs transition-colors"
                                    >
                                        Hapus
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}