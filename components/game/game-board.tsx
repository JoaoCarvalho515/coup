"use client";

import { useState } from "react";
import { Card as CardUI, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GameState, ActionType, CharacterType } from "@/lib/game-logic";
import { Coins, Crown, Skull, Shield, Users, BookOpen } from "lucide-react";
import Image from "next/image";
import { RulesModal } from "./rules-modal";
import { TargetSelectionModal } from "./target-selection-modal";

interface GameBoardProps {
    gameState: GameState;
    myPlayerId: string;
    onAction: (action: ActionType, targetId?: string) => void;
}

const CHARACTER_IMAGES: Record<CharacterType, string> = {
    Duke: "/textures/duke.jpg",
    Assassin: "/textures/assassin.jpg",
    Captain: "/textures/captain.jpg",
    Ambassador: "/textures/ambassador.jpg",
    Contessa: "/textures/contessa.jpg",
};

const formatLogMessage = (message: string, players: { name: string }[]) => {
    const characters = ["Duke", "Assassin", "Captain", "Ambassador", "Contessa"];
    const characterColors: Record<string, string> = {
        Duke: "text-purple-400 font-bold",
        Assassin: "text-red-400 font-bold",
        Captain: "text-cyan-400 font-bold",
        Ambassador: "text-indigo-400 font-bold",
        Contessa: "text-orange-400 font-bold",
    };

    const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const playerNames = players.map(p => p.name).filter(Boolean);
    playerNames.sort((a, b) => b.length - a.length);

    const patterns = [
        ...playerNames.map(name => `\\b${escapeRegExp(name)}\\b`),
        ...characters.map(char => `\\b${char}\\b`)
    ];

    if (patterns.length === 0) return message;

    const regex = new RegExp(`(${patterns.join('|')})`, 'g');

    const parts = message.split(regex);

    return parts.map((part, index) => {
        if (characters.includes(part)) {
            return <span key={index} className={characterColors[part]}>{part}</span>;
        } else if (playerNames.includes(part)) {
            return <span key={index} className="text-yellow-300 font-bold">{part}</span>;
        }
        return part;
    });
};

export function GameBoard({ gameState, myPlayerId, onAction }: GameBoardProps) {
    const [showRules, setShowRules] = useState(false);
    const [selectedTargetAction, setSelectedTargetAction] = useState<ActionType | null>(null);
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const myPlayer = gameState.players.find(p => p.id === myPlayerId);
    const isMyTurn = currentPlayer.id === myPlayerId;
    const alivePlayers = gameState.players.filter(p => p.isAlive);

    if (!myPlayer) return null;

    const handleTargetSelection = (targetId: string) => {
        if (selectedTargetAction) {
            onAction(selectedTargetAction, targetId);
            setSelectedTargetAction(null);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 md:p-6">
            <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />
            <TargetSelectionModal
                isOpen={!!selectedTargetAction}
                onClose={() => setSelectedTargetAction(null)}
                onSelect={handleTargetSelection}
                actionType={selectedTargetAction || ''}
                players={alivePlayers.filter(p => p.id !== myPlayerId)}
            />
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                                Coup
                            </h1>
                            <p className="text-slate-400 text-sm">
                                {currentPlayer.name}&apos;s Turn
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowRules(true)}
                            className="hidden md:flex gap-2 border-purple-500/50 text-purple-300 bg-transparent hover:text-white hover:bg-purple-900/50"
                        >
                            <BookOpen className="size-4" />
                            Rules
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowRules(true)}
                            className="md:hidden text-purple-300 hover:text-white hover:bg-purple-900/50"
                        >
                            <BookOpen className="size-5" />
                        </Button>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                            <Users className="size-4" />
                            <span>{alivePlayers.length} players alive</span>
                        </div>
                        <p className="text-lg font-semibold capitalize text-purple-400">
                            {gameState.phase.replace('_', ' ')}
                        </p>
                    </div>
                </div>

                {/* Action Area / Status Messages */}
                <div className="space-y-4">
                    {isMyTurn && gameState.phase === 'action' && myPlayer.isAlive && (
                        <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 backdrop-blur-sm rounded-lg p-6 border-2 border-purple-500/50 shadow-xl">
                            <h2 className="text-2xl font-bold mb-4 text-purple-300 flex items-center gap-2">
                                <Crown className="size-6" />
                                Choose Your Action
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                {/* Basic Actions */}
                                <Button
                                    onClick={() => onAction('income')}
                                    className="h-auto py-4 flex flex-col items-start bg-green-600 hover:bg-green-700 transition-all hover:scale-105"
                                >
                                    <span className="text-lg font-bold">Income</span>
                                    <span className="text-xs opacity-80">+1 coin (safe)</span>
                                </Button>

                                <Button
                                    onClick={() => onAction('foreign_aid')}
                                    className="h-auto py-4 flex flex-col items-start bg-blue-600 hover:bg-blue-700 transition-all hover:scale-105"
                                    disabled={myPlayer.coins >= 10}
                                >
                                    <span className="text-lg font-bold">Foreign Aid</span>
                                    <span className="text-xs opacity-80">+2 coins (blockable)</span>
                                </Button>

                                {/* Character Actions */}
                                <Button
                                    onClick={() => onAction('tax')}
                                    className="h-auto py-4 flex flex-col items-start bg-purple-600 hover:bg-purple-700 transition-all hover:scale-105"
                                    disabled={myPlayer.coins >= 10}
                                >
                                    <span className="text-lg font-bold">Tax (Duke)</span>
                                    <span className="text-xs opacity-80">+3 coins</span>
                                </Button>

                                <Button
                                    onClick={() => onAction('exchange')}
                                    className="h-auto py-4 flex flex-col items-start bg-indigo-600 hover:bg-indigo-700 transition-all hover:scale-105"
                                    disabled={myPlayer.coins >= 10}
                                >
                                    <span className="text-lg font-bold">Exchange (Ambassador)</span>
                                    <span className="text-xs opacity-80">Swap cards</span>
                                </Button>
                            </div>

                            {/* Targeted Actions */}
                            {alivePlayers.length > 1 && (
                                <div className="mt-6 space-y-4">
                                    <h3 className="text-lg font-semibold text-purple-300 border-b border-purple-500/30 pb-2">Targeted Actions</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {/* Steal */}
                                        <Button
                                            onClick={() => setSelectedTargetAction('steal')}
                                            className="h-auto py-4 flex flex-col items-start bg-cyan-900/30 border border-cyan-500 hover:bg-cyan-800 hover:text-white transition-colors"
                                            disabled={myPlayer.coins >= 10}
                                        >
                                            <span className="text-lg font-bold text-cyan-400">Steal (Captain)</span>
                                            <span className="text-xs opacity-80 text-left">Take 2 coins from opponent</span>
                                        </Button>

                                        {/* Assassinate */}
                                        <Button
                                            onClick={() => setSelectedTargetAction('assassinate')}
                                            className="h-auto py-4 flex flex-col items-start bg-red-900/30 border border-red-500 hover:bg-red-800 hover:text-white transition-colors"
                                            disabled={myPlayer.coins >= 10 || myPlayer.coins < 3}
                                        >
                                            <span className="text-lg font-bold text-red-400">Assassinate (Assassin)</span>
                                            <span className="text-xs opacity-80 text-left">Pay 3 coins to kill influence</span>
                                        </Button>

                                        {/* Coup */}
                                        <Button
                                            onClick={() => setSelectedTargetAction('coup')}
                                            className={`h-auto py-4 flex flex-col items-start border border-orange-500 transition-colors ${myPlayer.coins >= 10
                                                ? "bg-orange-600 hover:bg-orange-700 text-white animate-pulse"
                                                : "bg-orange-900/30 hover:bg-orange-800 hover:text-white"
                                                }`}
                                            disabled={myPlayer.coins < 7}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg font-bold text-orange-400">Coup</span>
                                                {myPlayer.coins >= 10 && (
                                                    <span className="text-xs bg-yellow-500 text-black px-1 rounded font-bold">REQUIRED</span>
                                                )}
                                            </div>
                                            <span className="text-xs opacity-80 text-left">Pay 7 coins to kill influence (Unblockable)</span>
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Waiting Message */}
                    {!isMyTurn && myPlayer.isAlive && gameState.phase === 'action' && (
                        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-8 text-center border border-slate-700 shadow-lg">
                            <div className="flex flex-col items-center gap-3">
                                <div className="size-12 rounded-full bg-slate-700 flex items-center justify-center animate-pulse">
                                    <Users className="size-6 text-slate-400" />
                                </div>
                                <p className="text-xl text-slate-300">
                                    Waiting for <span className="font-bold text-white text-2xl">{currentPlayer.name}</span> to take their turn...
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Waiting for Influence Loss */}
                    {gameState.phase === 'lose_influence' && gameState.pendingInfluenceLoss !== myPlayerId && myPlayer.isAlive && (
                        <div className="bg-red-900/20 backdrop-blur-sm rounded-lg p-8 text-center border-2 border-red-500/50 shadow-lg animate-pulse">
                            <div className="flex flex-col items-center gap-3">
                                <Skull className="size-12 text-red-400" />
                                <p className="text-xl text-red-300">
                                    Waiting for{" "}
                                    <span className="font-bold text-white text-2xl">
                                        {gameState.players.find(p => p.id === gameState.pendingInfluenceLoss)?.name}
                                    </span>
                                    {" "}to choose a card to reveal...
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Players Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                        gameState.players.find(p => p.id === myPlayerId)!,
                        ...gameState.players.filter(p => p.id !== myPlayerId)
                    ].filter(Boolean).map((player) => {
                        const isMe = player.id === myPlayerId;
                        const isCurrentTurn = player.id === currentPlayer.id;

                        return (
                            <div
                                key={player.id}
                                className={`rounded-lg p-4 transition-all relative overflow-hidden ${isMe
                                    ? "bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-2 border-purple-500/50 shadow-lg shadow-purple-500/20"
                                    : isCurrentTurn
                                        ? "bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-2 border-blue-500/50 shadow-lg shadow-blue-500/20"
                                        : player.isAlive
                                            ? "bg-slate-800/50 border border-slate-700"
                                            : "bg-slate-900/50 border border-slate-800 opacity-50"
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        {isMe ? (
                                            <div className="bg-purple-500/20 p-2 rounded-full">
                                                <Shield className="size-5 text-purple-400" />
                                            </div>
                                        ) : isCurrentTurn ? (
                                            <div className="bg-blue-500/20 p-2 rounded-full">
                                                <Crown className="size-5 text-blue-400" />
                                            </div>
                                        ) : (
                                            <div className="bg-slate-700/50 p-2 rounded-full">
                                                <Users className="size-5 text-slate-400" />
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="text-lg font-bold flex items-center gap-2">
                                                {player.name}
                                                {isMe && <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">You</span>}
                                            </h3>
                                            {!player.isAlive && (
                                                <span className="text-xs text-red-400 font-semibold">Eliminated</span>
                                            )}
                                            {player.isAlive && isCurrentTurn && !isMe && (
                                                <span className="text-xs text-blue-400">Current Turn</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full border border-white/5">
                                        <Coins className="size-4 text-yellow-400" />
                                        <span className="text-xl font-bold text-yellow-400">{player.coins}</span>
                                    </div>
                                </div>

                                <div className="flex gap-3 justify-center">
                                    {player.cards.map((card) => (
                                        <div
                                            key={card.id}
                                            className={`w-28 h-40 rounded-lg transition-all relative group overflow-hidden shadow-xl ${card.revealed
                                                ? "opacity-60 grayscale"
                                                : isMe
                                                    ? "hover:scale-105 hover:z-10 hover:shadow-purple-500/50 ring-2 ring-purple-500/50"
                                                    : "ring-1 ring-slate-600"
                                                }`}
                                            title={isMe && !card.revealed ? card.character : "Hidden Card"}
                                        >
                                            {card.revealed ? (
                                                <div className="w-full h-full relative bg-slate-900 flex flex-col items-center justify-center">
                                                    <Image
                                                        src={CHARACTER_IMAGES[card.character]}
                                                        alt={card.character}
                                                        fill
                                                        className="object-cover opacity-30"
                                                    />
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/40">
                                                        <Skull className="size-8 text-red-500 mb-1 drop-shadow-lg" />
                                                        <span className="text-xs font-bold text-red-500 bg-black/70 px-2 py-1 rounded border border-red-500/30">{card.character}</span>
                                                    </div>
                                                </div>
                                            ) : isMe ? (
                                                <div className="w-full h-full relative">
                                                    <Image
                                                        src={CHARACTER_IMAGES[card.character]}
                                                        alt={card.character}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2 pt-6">
                                                        <p className="text-center text-white font-bold text-sm shadow-black drop-shadow-md">{card.character}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="w-full h-full relative bg-slate-800">
                                                    <Image
                                                        src="/textures/card-back.svg"
                                                        alt="Hidden Card"
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Game Log */}
                <CardUI className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
                    <CardContent className="p-4">
                        <h3 className="text-lg font-semibold mb-3 text-purple-300">Game Log</h3>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                            {gameState.log.slice(-15).reverse().map((entry, index) => (
                                <p key={index} className="text-sm text-slate-400">
                                    <span className="text-slate-500">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                                    {" - "}
                                    {formatLogMessage(entry.message, gameState.players)}
                                </p>
                            ))}
                        </div>
                    </CardContent>
                </CardUI>

                {/* Winner Display */}
                {gameState.winner && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-gradient-to-br from-purple-900 to-pink-900 rounded-2xl p-8 border-4 border-yellow-500 shadow-2xl text-center animate-in zoom-in duration-500">
                            <div className="text-6xl mb-4">🎉</div>
                            <h2 className="text-4xl font-bold mb-2 text-yellow-400">Victory!</h2>
                            <p className="text-2xl text-white">
                                {gameState.players.find(p => p.id === gameState.winner)?.name} wins!
                            </p>
                            <Button
                                onClick={() => window.location.href = '/'}
                                className="mt-6 bg-yellow-500 hover:bg-yellow-600 text-black"
                            >
                                Back to Menu
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
