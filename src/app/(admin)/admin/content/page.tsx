"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import type { Reading, Question, CreateQuestionInput } from "@/src/modules/admin/types";
import {
    fetchReadings, createReading, updateReading, deleteReading,
    fetchQuestions, createQuestion, updateQuestion, deleteQuestion,
} from "@/src/modules/admin/api";

export default function ReadingsPage() {
    const [readings, setReadings] = useState<Reading[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ title: "", content: "", author: "" });

    const [expandedReading, setExpandedReading] = useState<string | null>(null);
    const [questions, setQuestions] = useState<Record<string, Question[]>>({});
    const [showQuestionForm, setShowQuestionForm] = useState<string | null>(null);
    const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
    const [questionFormData, setQuestionFormData] = useState({ questionText: "", options: "", correctAnswer: "" });

    const [initialized, setInitialized] = useState(false);

    const loadReadings = async () => {
        setLoading(true);
        try {
            const data = await fetchReadings();
            setReadings(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load readings");
        } finally {
            setLoading(false);
        }
    };

    if (!initialized) {
        setInitialized(true);
        loadReadings();
    }

    const loadQuestions = async (readingId: string) => {
        try {
            const data = await fetchQuestions(readingId);
            setQuestions((prev) => ({ ...prev, [readingId]: data }));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load questions");
        }
    };

    const toggleReading = (id: string) => {
        if (expandedReading === id) {
            setExpandedReading(null);
        } else {
            setExpandedReading(id);
            if (!questions[id]) loadQuestions(id);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updateReading(editingId, formData);
            } else {
                await createReading(formData);
            }
            setFormData({ title: "", content: "", author: "" });
            setShowForm(false);
            setEditingId(null);
            loadReadings();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save reading");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this reading?")) return;
        try {
            await deleteReading(id);
            loadReadings();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete reading");
        }
    };

    const startEdit = (r: Reading) => {
        setEditingId(r.readingId);
        setFormData({ title: r.title, content: r.content, author: r.category });
        setShowForm(true);
    };

    const handleQuestionSubmit = async (readingId: string, e: React.FormEvent) => {
        e.preventDefault();
        const input: CreateQuestionInput = {
            questionText: questionFormData.questionText,
            options: questionFormData.options.split("\n").filter(Boolean),
            correctAnswer: questionFormData.correctAnswer,
        };
        try {
            if (editingQuestionId) {
                await updateQuestion(editingQuestionId, input);
            } else {
                await createQuestion(readingId, input);
            }
            setQuestionFormData({ questionText: "", options: "", correctAnswer: "" });
            setShowQuestionForm(null);
            setEditingQuestionId(null);
            loadQuestions(readingId);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save question");
        }
    };

    const handleDeleteQuestion = async (readingId: string, questionId: string) => {
        if (!confirm("Delete this question?")) return;
        try {
            await deleteQuestion(questionId);
            loadQuestions(readingId);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete question");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Content Management</h2>
                    <p className="text-muted-foreground">Manage readings and quiz questions</p>
                </div>
                <Button onClick={() => { setShowForm(true); setEditingId(null); setFormData({ title: "", content: "", author: "" }); }}>
                    <Plus className="size-4 mr-2" /> Add Reading
                </Button>
            </div>

            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>{editingId ? "Edit Reading" : "New Reading"}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="content">Content</Label>
                                <textarea
                                    id="content"
                                    className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="author">Author</Label>
                                <Input id="author" value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} required />
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit">{editingId ? "Update" : "Create"}</Button>
                                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-2">
                {loading && <p className="text-muted-foreground">Loading readings...</p>}
                {readings.map((r) => (
                    <Card key={r.readingId}>
                        <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3 flex-1">
                                <button onClick={() => toggleReading(r.readingId)} className="text-muted-foreground hover:text-foreground">
                                    {expandedReading === r.readingId ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                                </button>
                                <BookOpen className="size-4 text-primary" />
                                <div>
                                    <p className="font-medium">{r.title}</p>
                                    <p className="text-xs text-muted-foreground">{r.category}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => startEdit(r)}><Pencil className="size-4" /></Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(r.readingId)}><Trash2 className="size-4 text-destructive" /></Button>
                            </div>
                        </div>

                        {expandedReading === r.readingId && (
                            <div className="px-4 pb-4">
                                <Separator className="mb-4" />
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-medium">Questions ({questions[r.readingId]?.length || 0})</h4>
                                    <Button size="sm" onClick={() => { setShowQuestionForm(r.readingId); setEditingQuestionId(null); setQuestionFormData({ questionText: "", options: "", correctAnswer: "" }); }}>
                                        <Plus className="size-3 mr-1" /> Add Question
                                    </Button>
                                </div>

                                {showQuestionForm === r.readingId && (
                                    <form onSubmit={(e) => handleQuestionSubmit(r.readingId, e)} className="space-y-3 mb-4 p-3 bg-muted rounded-lg">
                                        <div className="space-y-2">
                                            <Label>Question Text</Label>
                                            <Input value={questionFormData.questionText} onChange={(e) => setQuestionFormData({ ...questionFormData, questionText: e.target.value })} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Options (one per line)</Label>
                                            <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" value={questionFormData.options} onChange={(e) => setQuestionFormData({ ...questionFormData, options: e.target.value })} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Correct Answer</Label>
                                            <Input value={questionFormData.correctAnswer} onChange={(e) => setQuestionFormData({ ...questionFormData, correctAnswer: e.target.value })} required />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button type="submit" size="sm">{editingQuestionId ? "Update" : "Create"}</Button>
                                            <Button type="button" variant="outline" size="sm" onClick={() => setShowQuestionForm(null)}>Cancel</Button>
                                        </div>
                                    </form>
                                )}

                                <div className="space-y-2">
                                    {(questions[r.readingId] || []).map((q) => (
                                        <div key={q.id} className="flex items-center justify-between p-2 bg-background rounded border">
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">{q.questionText}</p>
                                                <p className="text-xs text-muted-foreground">Answer: {q.correctAnswer}</p>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button variant="ghost" size="sm" onClick={() => { setEditingQuestionId(q.id); setQuestionFormData({ questionText: q.questionText, options: q.options.join("\n"), correctAnswer: q.correctAnswer }); setShowQuestionForm(r.readingId); }}>
                                                    <Pencil className="size-3" />
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDeleteQuestion(r.readingId, q.id)}>
                                                    <Trash2 className="size-3 text-destructive" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
}
