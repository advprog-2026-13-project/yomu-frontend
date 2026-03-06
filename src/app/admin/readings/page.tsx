import AdminReadingsTable from "@/modules/readings/components/AdminReadingsTable";

export default function AdminReadingsPage() {
    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-5xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Manajemen Konten Modul 2</h1>
                    <p className="text-gray-500 mt-2">Kelola teks bacaan dan soal kuis untuk pelajar Yomu.</p>
                </div>
                <AdminReadingsTable />
            </div>
        </main>
    );
}