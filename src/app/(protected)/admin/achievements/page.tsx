"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Target, Plus, Edit, Trash2, RotateCcw, UserMinus, Loader2, Award, Star, X } from "lucide-react";
import { useMasterAchievements, useAdminAchievementActions } from "@/src/modules/achievements/hooks";
import { useAuth } from "@/src/modules/auth";
import type { Achievement, DailyMission } from "@/src/modules/achievements/types";

export default function AdminAchievementsPage() {
    const router = useRouter();
    const { user } = useAuth();
    
    const { 
        achievements, 
        dailyMissions, 
        loading: masterLoading, 
        error: masterError 
    } = useMasterAchievements();

    const { 
        createAchievement, 
        updateAchievement, 
        deleteAchievement, 
        createDailyMission, 
        updateDailyMission, 
        deleteDailyMission, 
        resetAll, 
        resetForUser, 
        loading: actionLoading 
    } = useAdminAchievementActions();

    // Modals & Panels State
    const [activeModal, setActiveModal] = useState<"create_ach" | "edit_ach" | "create_mission" | "edit_mission" | null>(null);
    const [selectedItem, setSelectedItem] = useState<Achievement | DailyMission | null>(null);

    // Form Fields State
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState("READING_COMPLETED"); // For achievements
    const [targetType, setTargetType] = useState("READING_COMPLETED"); // For daily missions
    const [milestone, setMilestone] = useState(1);

    // User Reset State
    const [userIdToReset, setUserIdToReset] = useState("");
    const [resettingUser, setResettingUser] = useState(false);

    useEffect(() => {
        if (user && user.role !== "ADMIN") {
            router.replace("/readings");
        }
    }, [user, router]);

    // Handle Open Modals
    const openCreateAchModal = () => {
        setName("");
        setDescription("");
        setType("READING_COMPLETED");
        setMilestone(1);
        setActiveModal("create_ach");
    };

    const openEditAchModal = (ach: Achievement) => {
        setSelectedItem(ach);
        setName(ach.name);
        setDescription(ach.description);
        setType(ach.type);
        setMilestone(ach.milestone);
        setActiveModal("edit_ach");
    };

    const openCreateMissionModal = () => {
        setName("");
        setDescription("");
        setTargetType("READING_COMPLETED");
        setMilestone(1);
        setActiveModal("create_mission");
    };

    const openEditMissionModal = (mission: DailyMission) => {
        setSelectedItem(mission);
        setName(mission.name);
        setDescription(mission.description);
        setTargetType(mission.targetType);
        setMilestone(mission.milestone);
        setActiveModal("edit_mission");
    };

    // Submissions
    const handleSaveAchievement = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !description || milestone < 1) {
            alert("Harap isi semua kolom dengan benar!");
            return;
        }

        if (activeModal === "edit_ach" && selectedItem) {
            const success = await updateAchievement(selectedItem.id, { name, description, milestone });
            if (success) {
                alert("Achievement berhasil diperbarui!");
                setActiveModal(null);
                window.location.reload();
            }
        } else {
            const success = await createAchievement({ name, description, type, milestone });
            if (success) {
                alert("Achievement baru berhasil dibuat!");
                setActiveModal(null);
                window.location.reload();
            }
        }
    };

    const handleSaveDailyMission = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !description || milestone < 1) {
            alert("Harap isi semua kolom dengan benar!");
            return;
        }

        if (activeModal === "edit_mission" && selectedItem) {
            const success = await updateDailyMission(selectedItem.id, { name, description, milestone });
            if (success) {
                alert("Misi harian berhasil diperbarui!");
                setActiveModal(null);
                window.location.reload();
            }
        } else {
            const success = await createDailyMission({ name, description, targetType, milestone });
            if (success) {
                alert("Misi harian baru berhasil dibuat!");
                setActiveModal(null);
                window.location.reload();
            }
        }
    };

    const handleDeleteAchievementClick = async (id: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus achievement ini?")) return;
        const success = await deleteAchievement(id);
        if (success) {
            alert("Achievement berhasil dihapus!");
            window.location.reload();
        }
    };

    const handleDeleteDailyMissionClick = async (id: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus misi harian ini?")) return;
        const success = await deleteDailyMission(id);
        if (success) {
            alert("Misi harian berhasil dihapus!");
            window.location.reload();
        }
    };

    // Reset Handlers
    const handleResetAllDailyMissions = async () => {
        if (!confirm("PENTING: Apakah Anda yakin ingin mereset progres Misi Harian seluruh siswa hari ini? Tindakan ini tidak dapat dibatalkan.")) return;
        const success = await resetAll();
        if (success) {
            alert("Seluruh misi harian hari ini berhasil direset ke progres 0!");
        } else {
            alert("Gagal melakukan reset harian.");
        }
    };

    const handleResetUserMissions = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userIdToReset) {
            alert("Harap masukkan UUID User terlebih dahulu!");
            return;
        }
        setResettingUser(true);
        const success = await resetForUser(userIdToReset);
        setResettingUser(false);
        if (success) {
            alert(`Misi harian untuk User UUID ${userIdToReset} berhasil direset!`);
            setUserIdToReset("");
        } else {
            alert("Gagal melakukan reset. Pastikan UUID User valid dan terdaftar.");
        }
    };

    if (user && user.role !== "ADMIN") return null;

    const loading = masterLoading;
    const error = masterError;

    return (
        <div className="yomu-page-container flex flex-col space-y-12 max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-yomu-border pb-6">
                <div>
                    <h1 className="yomu-heading-1 font-bold text-yomu-primary-dark">Kelola Pencapaian & Misi</h1>
                    <p className="yomu-text-muted">Desain lencana luhur (Achievements), rencanakan target harian (Daily Missions), dan lakukan reset progres.</p>
                </div>
            </div>

            {/* RESET PANEL */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-yomu-surface border border-yomu-border rounded-2xl p-6 shadow-sm">
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-yomu-primary flex items-center gap-2">
                        <RotateCcw size={20} className="text-yomu-accent" />
                        Global Reset Misi Harian
                    </h2>
                    <p className="text-sm text-yomu-text-secondary">
                        Tekan tombol di bawah untuk mereset seluruh progres misi harian semua siswa secara instan untuk hari ini.
                    </p>
                    <button
                        onClick={handleResetAllDailyMissions}
                        disabled={actionLoading}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-yomu-accent text-white rounded-xl font-semibold hover:bg-yomu-accent-dark transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-yomu-accent/15"
                    >
                        {actionLoading ? <Loader2 className="animate-spin" size={16} /> : <RotateCcw size={16} />}
                        Reset Semua Progres Hari Ini
                    </button>
                </div>

                <div className="space-y-4 border-t lg:border-t-0 lg:border-l border-yomu-border pt-4 lg:pt-0 lg:pl-6">
                    <h2 className="text-lg font-bold text-yomu-primary flex items-center gap-2">
                        <UserMinus size={20} />
                        Reset Misi Per Siswa
                    </h2>
                    <p className="text-sm text-yomu-text-secondary">
                        Reset progres misi harian untuk siswa tertentu secara manual dengan memasukkan UUID User mereka.
                    </p>
                    <form onSubmit={handleResetUserMissions} className="flex gap-2">
                        <input
                            type="text"
                            value={userIdToReset}
                            onChange={(e) => setUserIdToReset(e.target.value)}
                            placeholder="Masukkan UUID User siswa..."
                            className="flex-1 px-4 py-2 border border-yomu-border rounded-xl focus:outline-yomu-primary bg-yomu-surface text-sm font-medium"
                            required
                        />
                        <button
                            type="submit"
                            disabled={resettingUser}
                            className="px-4 py-2 bg-yomu-primary text-white rounded-xl text-sm font-semibold hover:bg-yomu-primary-dark transition-colors disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                        >
                            {resettingUser ? <Loader2 className="animate-spin" size={14} /> : null}
                            Reset
                        </button>
                    </form>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col justify-center items-center p-12 space-y-4">
                    <Loader2 className="animate-spin text-yomu-primary" size={40} />
                    <p className="text-yomu-text-secondary animate-pulse">Memuat data pencapaian...</p>
                </div>
            ) : error ? (
                <div className="yomu-card p-4 border-yomu-destructive/50 bg-yomu-destructive/10 text-yomu-destructive">
                    <p>Gagal memuat data: {error.message}</p>
                </div>
            ) : (
                <>
                    {/* DAILY MISSION SECTION */}
                    <section className="space-y-6">
                        <div className="flex justify-between items-center border-b border-yomu-border pb-3">
                            <h2 className="yomu-heading-2 flex items-center">
                                <Target className="mr-2 text-yomu-accent" />
                                Misi Harian (Daily Missions)
                            </h2>
                            <button
                                onClick={openCreateMissionModal}
                                className="inline-flex items-center gap-1 px-4 py-2 bg-yomu-primary text-white rounded-xl text-xs font-semibold hover:bg-yomu-primary-dark transition-all cursor-pointer shadow-sm shadow-yomu-primary/10"
                            >
                                <Plus size={14} />
                                Tambah Misi
                            </button>
                        </div>
                        
                        {dailyMissions.length === 0 ? (
                            <div className="yomu-card p-8 text-center border-dashed border-2 flex flex-col items-center justify-center">
                                <Star size={36} className="text-yomu-text-secondary mb-2" />
                                <p className="text-yomu-text-secondary font-medium">Belum ada misi harian yang aktif.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {dailyMissions.map((mission) => (
                                    <div key={mission.id} className="yomu-card p-6 flex flex-col h-full border border-yomu-border relative overflow-hidden group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-10 h-10 bg-yomu-accent-light rounded-full flex items-center justify-center text-yomu-accent">
                                                <Star size={20} />
                                            </div>
                                            <span className="text-[10px] font-bold text-yomu-accent bg-yomu-accent-light px-2.5 py-1 rounded-full uppercase">
                                                {mission.targetType.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <h3 className="yomu-heading-3 font-semibold mb-1 pr-16">{mission.name}</h3>
                                        <p className="text-sm text-yomu-text-secondary mb-6">{mission.description}</p>
                                        
                                        <div className="mt-auto pt-4 border-t border-yomu-border flex items-center justify-between text-xs font-medium">
                                            <span className="text-yomu-text-secondary">Target: <strong className="text-yomu-foreground">{mission.milestone}</strong></span>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openEditMissionModal(mission)}
                                                    className="p-1.5 border border-yomu-border rounded-lg hover:border-yomu-primary hover:text-yomu-primary transition-colors cursor-pointer text-yomu-text-secondary"
                                                    title="Edit Misi"
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteDailyMissionClick(mission.id)}
                                                    className="p-1.5 border border-red-100 rounded-lg hover:bg-red-50 text-red-600 transition-colors cursor-pointer"
                                                    title="Hapus Misi"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* ACHIEVEMENT SECTION */}
                    <section className="space-y-6">
                        <div className="flex justify-between items-center border-b border-yomu-border pb-3">
                            <h2 className="yomu-heading-2 flex items-center">
                                <Trophy className="mr-2 text-yomu-primary" />
                                Pencapaian (Achievements)
                            </h2>
                            <button
                                onClick={openCreateAchModal}
                                className="inline-flex items-center gap-1 px-4 py-2 bg-yomu-primary text-white rounded-xl text-xs font-semibold hover:bg-yomu-primary-dark transition-all cursor-pointer shadow-sm shadow-yomu-primary/10"
                            >
                                <Plus size={14} />
                                Tambah Lencana
                            </button>
                        </div>
                        
                        {achievements.length === 0 ? (
                            <div className="yomu-card p-8 text-center border-dashed border-2 flex flex-col items-center justify-center">
                                <Award size={36} className="text-yomu-text-secondary mb-2" />
                                <p className="text-yomu-text-secondary font-medium">Belum ada achievement yang dibuat.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {achievements.map((ach) => (
                                    <div key={ach.id} className="yomu-card p-6 flex items-center gap-6 border border-yomu-border group relative">
                                        <div className="w-14 h-14 bg-yomu-primary-light rounded-full flex items-center justify-center text-yomu-primary flex-shrink-0">
                                            <Award size={28} />
                                        </div>
                                        <div className="flex-1 min-w-0 pr-16">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="yomu-heading-3 font-semibold truncate">{ach.name}</h3>
                                                <span className="text-[9px] font-bold text-yomu-primary bg-yomu-primary-light px-2 py-0.5 rounded-full uppercase whitespace-nowrap">
                                                    {ach.type.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <p className="text-sm text-yomu-text-secondary mb-2 line-clamp-2">{ach.description}</p>
                                            <span className="text-xs text-yomu-text-secondary font-medium">
                                                Milestone: <strong className="text-yomu-foreground">{ach.milestone}</strong>
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-1.5 absolute top-6 right-6">
                                            <button
                                                onClick={() => openEditAchModal(ach)}
                                                className="p-1.5 border border-yomu-border rounded-lg hover:border-yomu-primary hover:text-yomu-primary transition-colors cursor-pointer text-yomu-text-secondary"
                                                title="Edit Achievement"
                                            >
                                                <Edit size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteAchievementClick(ach.id)}
                                                className="p-1.5 border border-red-100 rounded-lg hover:bg-red-50 text-red-600 transition-colors cursor-pointer"
                                                title="Hapus"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </>
            )}

            {/* MODAL ACHIEVEMENT */}
            {(activeModal === "create_ach" || activeModal === "edit_ach") && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-yomu-surface rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="bg-yomu-primary p-6 text-white flex justify-between items-center">
                            <h2 className="text-lg font-bold font-heading">
                                {activeModal === "create_ach" ? "Buat Achievement Baru" : "Edit Achievement"}
                            </h2>
                            <button 
                                onClick={() => setActiveModal(null)}
                                className="text-white/80 hover:text-white transition-colors cursor-pointer"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveAchievement} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-yomu-text-secondary mb-1">Nama Lencana</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-2 border border-yomu-border rounded-xl focus:outline-yomu-primary bg-yomu-surface text-sm font-medium"
                                    placeholder="Contoh: Kutu Buku Ulung"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-yomu-text-secondary mb-1">Deskripsi Target</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-4 py-2 border border-yomu-border rounded-xl focus:outline-yomu-primary bg-yomu-surface text-sm min-h-[80px]"
                                    placeholder="Contoh: Selesaikan 10 materi bacaan."
                                    required
                                />
                            </div>
                            
                            {activeModal === "create_ach" && (
                                <div>
                                    <label className="block text-sm font-semibold text-yomu-text-secondary mb-1">Aksi Pemicu (Type)</label>
                                    <select
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                        className="w-full px-4 py-2 border border-yomu-border rounded-xl focus:outline-yomu-primary bg-yomu-surface text-sm font-semibold text-yomu-primary-dark"
                                    >
                                        <option value="READING_COMPLETED">READING_COMPLETED (Membaca materi)</option>
                                        <option value="QUIZ_COMPLETED">QUIZ_COMPLETED (Menyelesaikan kuis)</option>
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-yomu-text-secondary mb-1">Milestone (Angka Target)</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={milestone}
                                    onChange={(e) => setMilestone(parseInt(e.target.value) || 1)}
                                    className="w-full px-4 py-2 border border-yomu-border rounded-xl focus:outline-yomu-primary bg-yomu-surface text-sm font-semibold text-yomu-primary"
                                    required
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-yomu-border">
                                <button
                                    type="button"
                                    onClick={() => setActiveModal(null)}
                                    className="px-4 py-2 border border-yomu-border text-yomu-text-secondary rounded-xl hover:bg-gray-50 text-sm font-medium cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="px-5 py-2 bg-yomu-primary text-white rounded-xl text-sm font-semibold hover:bg-yomu-primary-dark transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-md shadow-yomu-primary/10"
                                >
                                    {actionLoading && <Loader2 className="animate-spin" size={14} />}
                                    Simpan Lencana
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL DAILY MISSION */}
            {(activeModal === "create_mission" || activeModal === "edit_mission") && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-yomu-surface rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="bg-yomu-primary p-6 text-white flex justify-between items-center">
                            <h2 className="text-lg font-bold font-heading">
                                {activeModal === "create_mission" ? "Buat Misi Harian Baru" : "Edit Misi Harian"}
                            </h2>
                            <button 
                                onClick={() => setActiveModal(null)}
                                className="text-white/80 hover:text-white transition-colors cursor-pointer"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveDailyMission} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-yomu-text-secondary mb-1">Nama Misi</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-2 border border-yomu-border rounded-xl focus:outline-yomu-primary bg-yomu-surface text-sm font-medium"
                                    placeholder="Contoh: Baca 3 Artikel Hari Ini"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-yomu-text-secondary mb-1">Deskripsi Target</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-4 py-2 border border-yomu-border rounded-xl focus:outline-yomu-primary bg-yomu-surface text-sm min-h-[80px]"
                                    placeholder="Contoh: Selesaikan aktivitas membaca 3 artikel berlabel apa saja."
                                    required
                                />
                            </div>
                            
                            {activeModal === "create_mission" && (
                                <div>
                                    <label className="block text-sm font-semibold text-yomu-text-secondary mb-1">Aksi Pemicu (Target Type)</label>
                                    <select
                                        value={targetType}
                                        onChange={(e) => setTargetType(e.target.value)}
                                        className="w-full px-4 py-2 border border-yomu-border rounded-xl focus:outline-yomu-primary bg-yomu-surface text-sm font-semibold text-yomu-accent"
                                    >
                                        <option value="READING_COMPLETED">READING_COMPLETED (Membaca materi)</option>
                                        <option value="QUIZ_COMPLETED">QUIZ_COMPLETED (Menyelesaikan kuis)</option>
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-yomu-text-secondary mb-1">Milestone (Target Hari Ini)</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={milestone}
                                    onChange={(e) => setMilestone(parseInt(e.target.value) || 1)}
                                    className="w-full px-4 py-2 border border-yomu-border rounded-xl focus:outline-yomu-primary bg-yomu-surface text-sm font-semibold text-yomu-primary"
                                    required
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-yomu-border">
                                <button
                                    type="button"
                                    onClick={() => setActiveModal(null)}
                                    className="px-4 py-2 border border-yomu-border text-yomu-text-secondary rounded-xl hover:bg-gray-50 text-sm font-medium cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="px-5 py-2 bg-yomu-primary text-white rounded-xl text-sm font-semibold hover:bg-yomu-primary-dark transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-md shadow-yomu-primary/10"
                                >
                                    {actionLoading && <Loader2 className="animate-spin" size={14} />}
                                    Simpan Misi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
