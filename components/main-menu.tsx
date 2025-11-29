"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function MainMenu() {
    const router = useRouter()

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="flex flex-col gap-4 w-full max-w-md px-4">
                <h1 className="text-4xl font-bold text-center mb-8">Coup</h1>

                <Button
                    size="lg"
                    onClick={() => router.push('/create')}
                    className="w-full text-lg py-6"
                >
                    Create New Game
                </Button>

                <Button
                    size="lg"
                    variant="outline"
                    onClick={() => router.push('/join')}
                    className="w-full text-lg py-6"
                >
                    Join Game
                </Button>
            </div>
        </div>
    )
}
