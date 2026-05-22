"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Achievement, DailyMission } from "@/src/modules/admin/types";
import {
    fetchAchievements, createAchievement, updateAchievement, deleteAchievement,
    fetchDailyMissions, createDailyMission, updateDailyMission, deleteDailyMission,
} from "@/src/modules/admin/api";

const TYPE_OPTIONS = ["READING_COMPLETED", "QUIZ_COMPLETED"] as const;

export default function AchievementsPage() {
    const [activeTab, setActiveTab] = useState<"achievements" | "missions">("achievements");
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [missions, setMissions] = useState<DailyMission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: "", description: "", type: "READING_COMPLETED" as string, milestone: "" });

    const [initialized, setInitialized] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const [a, m] = await Promise.all([fetchAchievements(), fetchDailyMissions()]);
            setAchievements(a);
            setMissions(m);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    if (!initialized) {
        setInitialized(true);
        loadData();
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const milestone = parseInt(formData.milestone, 10);
        if (isNaN(milestone) || milestone < 1) return;

        try {
            if (activeTab === "achievements") {
                if (editingId) {
                    await updateAchievement(editingId, { name: formData.name, description: formData.description || undefined, milestone });
                } else {
                    await createAchievement({ name: formData.name, description: formData.description || undefined, type: formData.type as "READING_COMPLETED" | "QUIZ_COMPLETED", milestone });
                }
            } else {
                if (editingId) {
                    await updateDailyMission(editingId, { name: formData.name, description: formData.description || undefined, milestone });
                } else {
                    await createDailyMission({ name: formData.name, description: formData.description || undefined, targetType: formData.type as "READING_COMPLETED" | "QUIZ_COMPLETED", milestone });
                }
            }
            setFormData({ name: "", description: "", type: "READING_COMPLETED", milestone: "" });
            setShowForm(false);
            setEditingId(null);
            loadData();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this item?")) return;
        try {
            if (activeTab === "achievements") await deleteAchievement(id);
            else await deleteDailyMission(id);
            loadData();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete");
        }
    };

    const startEdit = (item: Achievement | DailyMission) => {
        setEditingId(item.id);
        setFormData({
            name: item.name,
            description: item.description || "",
            type: "achievementType" in item ? item.achievementType : item.targetType,
            milestone: String(item.milestone),
        });
        setShowForm(true);
    };

    const items = activeTab === "achievements" ? achievements : missions;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Achievements & Missions</h2>
                    <p className="text-muted-foreground">Manage gamification content</p>
                </div>
                <Button onClick={() => { setShowForm(true); setEditingId(null); setFormData({ name: "", description: "", type: "READING_COMPLETED", milestone: "" }); }}>
                    <Plus className="size-4 mr-2" /> Add {activeTab === "achievements" ? "Achievement" : "Mission"}
                </Button>
            </div>

            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

            {/* Tabs */}
            <div className="flex gap-2 border-b border-border">
                <button
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "achievements" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                    onClick={() => setActiveTab("achievements")}
                >
                    Achievements
                </button>
                <button
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "missions" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                    onClick={() => setActiveTab("missions")}
                >
                    Daily Missions
                </button>
            </div>

            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>{editingId ? "Edit" : "New"} {activeTab === "achievements" ? "Achievement" : "Daily Mission"}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description (optional)</Label>
                                <Input id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="type">Type</Label>
                                <select
                                    id="type"
                                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                >
                                    {TYPE_OPTIONS.map((t) => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="milestone">Milestone (count)</Label>
                                <Input id="milestone" type="number" min="1" value={formData.milestone} onChange={(e) => setFormData({ ...formData, milestone: e.target.value })} required />
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit">{editingId ? "Update" : "Create"}</Button>
                                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {loading && <p className="text-muted-foreground">Loading...</p>}

            <div className="space-y-2">
                {items.length === 0 && !loading && (
                    <p className="text-muted-foreground text-center py-8">No {activeTab === "achievements" ? "achievements" : "daily missions"} yet</p>
                )}
                {items.map((item) => (
                    <Card key={item.id}>
                        <div className="flex items-center justify-between p-4">
                            <div className="flex-1">
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-muted-foreground">{item.description || "—"}</p>
                                <div className="flex gap-3 mt-1">
                                    <span className="text-xs px-2 py-0.5 rounded bg-muted">{"achievementType" in item ? item.achievementType : item.targetType}</span>
                                    <span className="text-xs text-muted-foreground">Milestone: {item.milestone}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => startEdit(item)}><Pencil className="size-4" /></Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}><Trash2 className="size-4 text-destructive" /></Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
