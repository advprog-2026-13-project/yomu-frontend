"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { deleteForumComment } from "@/src/modules/admin/api";

export default function ForumPage() {
    const [commentId, setCommentId] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [isError, setIsError] = useState(false);

    const handleDelete = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentId.trim()) return;

        setLoading(true);
        setMessage(null);
        setIsError(false);

        try {
            await deleteForumComment(commentId);
            setMessage("Comment deleted successfully");
            setCommentId("");
        } catch (err) {
            setIsError(true);
            setMessage(err instanceof Error ? err.message : "Failed to delete comment");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Forum Moderation</h2>
                <p className="text-muted-foreground">Manage forum comments</p>
            </div>

            {message && (
                <Alert variant={isError ? "destructive" : "default"}>
                    <AlertDescription>{message}</AlertDescription>
                </Alert>
            )}

            <Card className="max-w-md">
                <CardHeader>
                    <CardTitle>Delete Comment</CardTitle>
                    <CardDescription>Enter the comment ID to delete it</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleDelete} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="commentId">Comment ID (UUID)</Label>
                            <Input
                                id="commentId"
                                placeholder="Enter comment UUID"
                                value={commentId}
                                onChange={(e) => setCommentId(e.target.value)}
                            />
                        </div>
                        <Button type="submit" disabled={loading || !commentId.trim()} className="w-full">
                            <Trash2 className="size-4 mr-2" />
                            {loading ? "Deleting..." : "Delete Comment"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Note</CardTitle>
                    <CardDescription>
                        Full comment listing is not yet available via the API. This page currently supports deletion by ID only.
                        Future updates will add a complete moderation interface with comment browsing and filtering.
                    </CardDescription>
                </CardHeader>
            </Card>
        </div>
    );
}
