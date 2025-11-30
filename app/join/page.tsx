"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function JoinGame() {
    const [code, setCode] = useState("");
    const router = useRouter();

    const handleJoin = () => {
        const trimmedCode = code.trim().toUpperCase();
        if (trimmedCode.length === 4) {
            router.push(`/game/${trimmedCode}`);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toUpperCase().replace(/[^A-Z]/g, "");
        if (value.length <= 4) {
            setCode(value);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-linear-to-b from-background to-muted/20">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center space-y-2">
                    <CardTitle className="text-3xl">Join Game</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Enter the 4-letter game code
                    </p>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Input
                            placeholder="ABCD"
                            value={code}
                            onChange={handleInputChange}
                            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                            className="text-center text-3xl font-bold font-mono tracking-widest h-16 uppercase"
                            maxLength={4}
                            autoFocus
                        />
                        <p className="text-xs text-center text-muted-foreground">
                            {code.length}/4 characters
                        </p>
                    </div>

                    <Button
                        onClick={handleJoin}
                        className="w-full h-12 text-base font-semibold"
                        disabled={code.length !== 4}
                    >
                        Join Game
                    </Button>

                    <div className="pt-4 border-t">
                        <p className="text-xs text-center text-muted-foreground mb-3">
                            Don&apos;t have a code?
                        </p>
                        <Button
                            onClick={() => router.push("/create")}
                            variant="outline"
                            className="w-full"
                        >
                            Create New Game
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
