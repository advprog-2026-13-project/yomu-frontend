"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/services/api";
import {Reading} from "@/types";

export default function AdminReadingsList() {
    const [readings, setReadings] = useState<Reading[]>([]);

    useEffect(() => {
        api.getAdminReadings().then(data => setReadings(data));
    }, []);

    return (
        <div className="max-w-5xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manajemen Bacaan (Modul 2)</h1>
                <Link href="/admin/readings/create">
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded">
                        + Tambah Bacaan
                    </button>
                </Link>
            </div>

            <table className="w-full border-collapse border">
                <thead>
                <tr className="bg-gray-100">
                    <th className="border p-2 text-left">Judul</th>
                    <th className="border p-2 text-left">Kategori</th>
                    <th className="border p-2">Aksi</th>
                </tr>
                </thead>
                <tbody>
                {readings.map((r) => (
                    <tr key={r.readingId}>
                        <td className="border p-2">{r.title}</td>
                        <td className="border p-2">{r.category}</td>
                        <td className="border p-2 text-center space-x-2">
                            <Link href={`/admin/readings/${r.readingId}/questions`}>
                                <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm">
                                    Kelola Soal
                                </button>
                            </Link>
                            {/* TODO: Tambah tombol Edit dan Delete memanggil api.deleteReading */}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}