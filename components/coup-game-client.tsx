"use client";

import { usePartyCoup } from "@/lib/usePartyKit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Copy, CheckCheck, ArrowLeft } from "lucide-react";

interface CoupGameClientProps {
    roomCode: string;
}

export function CoupGameClient({ roomCode }: CoupGameClientProps) {
    const router = useRouter();
    const [playerName, setPlayerName] = useState("");
    const [hasJoined, setHasJoined] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState("");

    const {
        gameState,
        players,
        isConnected,
        error,
        hostId,
        isHost,
        joinGame,
        startGame,
        kickPlayer,
        performAction,
    } = usePartyCoup({
        roomCode,
        onKicked: () => router.push('/join'),
    });

    const handleCopyCode = () => {
        navigator.clipboard.writeText(roomCode.toUpperCase());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleJoin = () => {
        if (playerName.trim()) {
            joinGame(playerName);
            setHasJoined(true);
        }
    };

    const handleChangeName = () => {
        if (newName.trim()) {
            joinGame(newName);
            setPlayerName(newName);
            setIsEditingName(false);
            setNewName("");
        }
    };

    // Show connection status
    if (!isConnected) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <p className="text-xl">Connecting to game server...</p>
                </div>
            </div>
        );
    }
    // Show join screen if player hasn't joined yet
    if (!hasJoined) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
                <div className="w-full max-w-md space-y-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/join")}
                        className="gap-2"
                    >
                        <ArrowLeft className="size-4" />
                        Join Different Game
                    </Button>

                    <Card className="w-full">
                        <CardHeader className="text-center space-y-4">
                            <CardTitle className="text-3xl">Join Game</CardTitle>
                            <div className="flex items-center justify-center gap-2">
                                <p className="text-5xl font-bold font-mono tracking-wider text-primary">
                                    {roomCode.toUpperCase()}
                                </p>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleCopyCode}
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    {copied ? <CheckCheck className="size-5" /> : <Copy className="size-5" />}
                                </Button>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Share this code with your friends
                            </p>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Input
                                    placeholder="Enter your name"
                                    value={playerName}
                                    onChange={(e) => setPlayerName(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                                    className="text-center text-lg h-12"
                                />
                            </div>
                            <Button
                                onClick={handleJoin}
                                className="w-full h-12 text-base"
                                disabled={!playerName.trim()}
                            >
                                Join Game
                            </Button>

                            {error && (
                                <div className="p-3 bg-destructive/10 text-destructive rounded-md text-center text-sm">
                                    {error}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Show lobby if game hasn't started
    if (!gameState) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
                <Card className="w-full max-w-2xl">
                    <CardHeader className="text-center space-y-4 pb-4">
                        <div className="flex items-center justify-center gap-2">
                            <h1 className="text-6xl font-bold font-mono tracking-widest">
                                {roomCode.toUpperCase()}
                            </h1>
                            <Button
                                variant="ghost"
                                size="icon-lg"
                                onClick={handleCopyCode}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                {copied ? <CheckCheck className="size-6" /> : <Copy className="size-6" />}
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Users className="size-5" />
                                    <h2 className="text-lg font-semibold">Players</h2>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setIsEditingName(true);
                                        setNewName(playerName);
                                    }}
                                    className="text-xs"
                                >
                                    Change Name
                                </Button>
                            </div>

                            {isEditingName && (
                                <div className="space-y-2 p-3 bg-muted/50 rounded-lg border">
                                    <Input
                                        placeholder="Enter new name"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") handleChangeName();
                                            if (e.key === "Escape") {
                                                setIsEditingName(false);
                                                setNewName("");
                                            }
                                        }}
                                        className="h-9"
                                        autoFocus
                                    />
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={handleChangeName}
                                            size="sm"
                                            className="flex-1"
                                            disabled={!newName.trim()}
                                        >
                                            Update
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                setIsEditingName(false);
                                                setNewName("");
                                            }}
                                            variant="outline"
                                            size="sm"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2 min-h-[200px]">
                                {players.map((player, index) => (
                                    <div
                                        key={player.id}
                                        className="flex items-center justify-between gap-3 p-4 bg-secondary/50 hover:bg-secondary rounded-lg transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <span className="text-lg font-medium">{player.name}</span>
                                                {player.id === hostId && (
                                                    <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                                                        Host
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {isHost && player.id !== hostId && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => kickPlayer(player.id)}
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                            >
                                                Kick
                                            </Button>
                                        )}
                                    </div>
                                ))}

                                {players.length === 0 && (
                                    <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                                        <p className="text-center">
                                            Waiting for players to join...
                                        </p>
                                    </div>
                                )}

                                {players.length > 0 && players.length < 5 && (
                                    <div className="flex items-center gap-3 p-4 border-2 border-dashed border-muted-foreground/20 rounded-lg">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground font-bold">
                                            {players.length + 1}
                                        </div>
                                        <span className="text-muted-foreground">Waiting for player...</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t">
                            <Button
                                onClick={startGame}
                                className="w-full h-12 text-base font-semibold"
                                disabled={players.length < 2 || !isHost}
                                size="lg"
                            >
                                {players.length < 2 ? "Waiting for Players..." : isHost ? "Start" : "Waiting for Host..."}
                            </Button>
                            <p className="text-xs text-center text-muted-foreground">
                                {players.length < 2
                                    ? "Need at least 2 players to start"
                                    : !isHost
                                        ? "Only the host can start the game"
                                        : `${players.length} player${players.length !== 1 ? 's' : ''} ready • 2-6 players`
                                }
                            </p>
                        </div>

                        {error && (
                            <div className="p-3 bg-destructive/10 text-destructive rounded-md text-center text-sm">
                                {error}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Show game UI
    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Coup Game</h1>
                        <p className="text-muted-foreground">Room: {roomCode.toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-muted-foreground">Phase</p>
                        <p className="text-xl font-semibold capitalize">{gameState.phase}</p>
                    </div>
                </div>

                {/* Current Player */}
                <div className="p-4 bg-secondary rounded-lg">
                    <p className="text-sm text-muted-foreground">Current Turn</p>
                    <p className="text-2xl font-bold">
                        {gameState.players[gameState.currentPlayerIndex].name}
                    </p>
                </div>

                {/* Players Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {gameState.players.map((player) => (
                        <div
                            key={player.id}
                            className={`p-4 rounded-lg border-2 ${player.isAlive
                                ? "border-primary bg-card"
                                : "border-muted bg-muted opacity-50"
                                }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold">{player.name}</h3>
                                <span className="text-2xl font-bold text-primary">{player.coins}💰</span>
                            </div>
                            <div className="flex gap-2 mt-3">
                                {player.cards.map((card) => (
                                    <div
                                        key={card.id}
                                        className={`px-3 py-2 rounded ${card.revealed
                                            ? "bg-destructive/20 text-destructive"
                                            : "bg-primary/20 text-primary"
                                            }`}
                                    >
                                        {card.revealed ? card.character : "?"}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Game Log */}
                <div className="p-4 bg-secondary rounded-lg max-h-48 overflow-y-auto">
                    <h3 className="text-lg font-semibold mb-2">Game Log</h3>
                    <div className="space-y-1">
                        {gameState.log.slice(-10).reverse().map((entry, index) => (
                            <p key={index} className="text-sm text-muted-foreground">
                                {entry.message}
                            </p>
                        ))}
                    </div>
                </div>

                {/* Winner */}
                {gameState.winner && (
                    <div className="p-6 bg-primary text-primary-foreground rounded-lg text-center">
                        <h2 className="text-3xl font-bold">🎉 Winner! 🎉</h2>
                        <p className="text-2xl mt-2">
                            {gameState.players.find((p) => p.id === gameState.winner)?.name}
                        </p>
                    </div>
                )}

                {error && (
                    <div className="p-3 bg-destructive/10 text-destructive rounded-md">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}
