"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateGame() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function generateUniqueCode() {
            try {
                const response = await fetch('/api/generate-code');
                if (!response.ok) {
                    throw new Error('Failed to generate code');
                }

                const data = await response.json();
                router.push(`/game/${data.code}`);
            } catch (err) {
                console.error('Error generating code:', err);
                setError('Failed to create game. Please try again.');
            }
        }

        generateUniqueCode();
    }, [router]);

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-bold mb-4">Create Game</h1>
                    <p className="text-destructive">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <div className="text-center space-y-4">
                <h1 className="text-2xl font-bold mb-4">Create Game</h1>
                <p className="text-muted-foreground">Generating unique game code...</p>
            </div>
        </div>
    );
}
