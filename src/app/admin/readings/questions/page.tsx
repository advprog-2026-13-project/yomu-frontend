import AdminQuestionsManager from "@/modules/readings/components/AdminQuestionsManager";

export default function ManageQuestionsPage({ params }: { params: { id: string } }) {
    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Kelola Soal Kuis</h1>
                    <p className="text-gray-500 mt-2">Buat dan atur pilihan ganda untuk bacaan ini.</p>
                </div>

                {/* Panggil komponen manager soal dengan ID dari URL */}
                <AdminQuestionsManager readingId={params.id} />
            </div>
        </main>
    );
}