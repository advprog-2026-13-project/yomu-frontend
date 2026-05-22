import { useState, useEffect } from "react";
import type { Reading, QuestionResponse, QuizSubmissionRequest, QuizAttempt } from "./types";
import * as api from "./api";

export function useReadings() {
    const [readings, setReadings] = useState<Reading[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        api.fetchReadings()
            .then(setReadings)
            .catch(setError)
            .finally(() => setLoading(false));
    }, []);

    return { readings, loading, error };
}

export function useReadingDetails(id: string) {
    const [reading, setReading] = useState<Reading | null>(null);
    const [questions, setQuestions] = useState<QuestionResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!id) return;
        
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            try {
                const [readingData, questionsData] = await Promise.all([
                    api.fetchReadingById(id),
                    api.fetchReadingQuestions(id)
                ]);
                if (!cancelled) {
                    setReading(readingData);
                    setQuestions(questionsData);
                }
            } catch (err) {
                if (!cancelled) setError(err instanceof Error ? err : new Error(String(err)));
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        Promise.resolve().then(() => load());

        return () => { cancelled = true; };
    }, [id]);

    return { reading, questions, loading, error };
}

export function useSubmitQuiz() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const submit = async (id: string, payload: QuizSubmissionRequest): Promise<QuizAttempt | null> => {
        setLoading(true);
        setError(null);
        try {
            const attempt = await api.submitQuiz(id, payload);
            return attempt;
        } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { submit, loading, error };
}

export function useCompleteReading() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const complete = async (id: string): Promise<boolean> => {
        setLoading(true);
        setError(null);
        try {
            await api.completeReading(id);
            return true;
        } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { complete, loading, error };
}

export function useAdminReadings() {
    const [readings, setReadings] = useState<Reading[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const refresh = () => {
        setLoading(true);
        api.adminGetAll()
            .then(setReadings)
            .catch(setError)
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        Promise.resolve().then(() => refresh());
    }, []);

    return { readings, loading, error, refresh };
}

export function useAdminActions() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const createReading = async (payload: { title: string; content: string; author: string }) => {
        setLoading(true);
        setError(null);
        try {
            return await api.adminCreateReading(payload);
        } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
            return null;
        } finally {
            setLoading(false);
        }
    };

    const updateReading = async (id: string, payload: { title: string; content: string; author: string }) => {
        setLoading(true);
        setError(null);
        try {
            return await api.adminUpdateReading(id, payload);
        } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
            return null;
        } finally {
            setLoading(false);
        }
    };

    const deleteReading = async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            await api.adminDeleteReading(id);
            return true;
        } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
            return false;
        } finally {
            setLoading(false);
        }
    };

    const hideReading = async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            await api.adminHideReading(id);
            return true;
        } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
            return false;
        } finally {
            setLoading(false);
        }
    };

    const unhideReading = async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            await api.adminUnhideReading(id);
            return true;
        } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
            return false;
        } finally {
            setLoading(false);
        }
    };

    const addQuestion = async (
        readingId: string,
        payload: { questionText: string; options: string[]; correctAnswer: string }
    ) => {
        setLoading(true);
        setError(null);
        try {
            return await api.adminAddQuestion(readingId, payload);
        } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
            return null;
        } finally {
            setLoading(false);
        }
    };

    const updateQuestion = async (
        questionId: string,
        payload: { questionText: string; options: string[]; correctAnswer: string }
    ) => {
        setLoading(true);
        setError(null);
        try {
            return await api.adminUpdateQuestion(questionId, payload);
        } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
            return null;
        } finally {
            setLoading(false);
        }
    };

    const deleteQuestion = async (questionId: string) => {
        setLoading(true);
        setError(null);
        try {
            await api.adminDeleteQuestion(questionId);
            return true;
        } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { 
        createReading, 
        updateReading, 
        deleteReading, 
        hideReading, 
        unhideReading, 
        addQuestion, 
        updateQuestion, 
        deleteQuestion, 
        loading, 
        error 
    };
}


