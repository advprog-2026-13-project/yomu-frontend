import AdminReadingForm from "@/modules/readings/components/AdminReadingForm";

export default function CreateReadingPage() {
    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-5xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Tambah Bacaan Baru</h1>
                    <p className="text-gray-500 mt-2">Masukkan detail teks bacaan untuk Modul 2.</p>
                </div>
                <AdminReadingForm />
            </div>
        </main>
    );
}