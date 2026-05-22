export default function DashboardPage() {
    return (
        <div className="yomu-page-container flex flex-col items-center justify-center text-center space-y-4">
            <h1 className="yomu-heading-1 font-bold">Dashboard</h1>
            <p className="yomu-text-muted max-w-md">Overview aktivitas, progress bacaan, dan rangkuman harian kamu akan muncul di sini.</p>
            <div className="p-8 yomu-card mt-8 w-full max-w-md border-dashed border-2">
                <p className="text-yomu-text-secondary italic">Fitur ini sedang dalam pengembangan...</p>
            </div>
        </div>
    );
}
