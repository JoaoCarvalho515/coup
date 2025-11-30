"use client";

import { Card as CardUI, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GameState, ActionType, CharacterType } from "@/lib/game-logic";
import { Coins, Crown, Skull, Shield, Users } from "lucide-react";

interface GameBoardProps {
    gameState: GameState;
    myPlayerId: string;
    onAction: (action: ActionType, targetId?: string) => void;
}

const CHARACTER_ICONS: Record<CharacterType, string> = {
    Duke: "👑",
    Assassin: "🗡️",
    Captain: "⚓",
    Ambassador: "📜",
    Contessa: "🛡️",
};

export function GameBoard({ gameState, myPlayerId, onAction }: GameBoardProps) {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const myPlayer = gameState.players.find(p => p.id === myPlayerId);
    const isMyTurn = currentPlayer.id === myPlayerId;
    const alivePlayers = gameState.players.filter(p => p.isAlive);

    if (!myPlayer) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                            Coup
                        </h1>
                        <p className="text-slate-400 text-sm">
                            {currentPlayer.name}&apos;s Turn
                        </p>
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

                                    {/* Steal */}
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-slate-400">
                                            <span className="font-bold text-cyan-400">Steal (Captain)</span>
                                            <span>- Take 2 coins</span>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                                            {alivePlayers
                                                .filter(p => p.id !== myPlayerId)
                                                .map(player => (
                                                    <Button
                                                        key={player.id}
                                                        onClick={() => onAction('steal', player.id)}
                                                        variant="outline"
                                                        className="bg-cyan-900/30 border-cyan-500 hover:bg-cyan-800 hover:text-white transition-colors"
                                                        disabled={myPlayer.coins >= 10}
                                                    >
                                                        {player.name}
                                                    </Button>
                                                ))}
                                        </div>
                                    </div>

                                    {/* Assassinate */}
                                    {myPlayer.coins >= 3 && (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                                <span className="font-bold text-red-400">Assassinate (Assassin)</span>
                                                <span>- 3 coins, kill influence</span>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                                                {alivePlayers
                                                    .filter(p => p.id !== myPlayerId)
                                                    .map(player => (
                                                        <Button
                                                            key={player.id}
                                                            onClick={() => onAction('assassinate', player.id)}
                                                            variant="outline"
                                                            className="bg-red-900/30 border-red-500 hover:bg-red-800 hover:text-white transition-colors"
                                                            disabled={myPlayer.coins >= 10}
                                                        >
                                                            {player.name}
                                                        </Button>
                                                    ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Coup */}
                                    {myPlayer.coins >= 7 && (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                                <span className="font-bold text-orange-400">Coup</span>
                                                <span>- 7 coins, kill influence (unchallengeable)</span>
                                                {myPlayer.coins >= 10 && (
                                                    <span className="text-yellow-400 font-bold ml-2 animate-pulse">REQUIRED!</span>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                                                {alivePlayers
                                                    .filter(p => p.id !== myPlayerId)
                                                    .map(player => (
                                                        <Button
                                                            key={player.id}
                                                            onClick={() => onAction('coup', player.id)}
                                                            variant="outline"
                                                            className={`border-orange-500 transition-colors ${myPlayer.coins >= 10
                                                                ? "bg-orange-600 hover:bg-orange-700 text-white animate-pulse"
                                                                : "bg-orange-900/30 hover:bg-orange-800 hover:text-white"
                                                                }`}
                                                        >
                                                            {player.name}
                                                        </Button>
                                                    ))}
                                            </div>
                                        </div>
                                    )}
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
                                            className={`${isMe ? "w-20 h-28 text-3xl" : "w-16 h-24 text-2xl"} rounded-lg flex flex-col items-center justify-center font-bold transition-all relative group ${card.revealed
                                                ? "bg-red-900/50 border-2 border-red-500 opacity-70"
                                                : isMe
                                                    ? "bg-gradient-to-br from-purple-600 to-pink-600 border-2 border-purple-400 shadow-lg shadow-purple-500/50"
                                                    : "bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-slate-600"
                                                }`}
                                            title={isMe && !card.revealed ? card.character : "Hidden Card"}
                                        >
                                            {card.revealed ? (
                                                <>
                                                    <Skull className={`${isMe ? "size-8" : "size-6"} text-red-400 mb-1`} />
                                                    <span className={`${isMe ? "text-xs" : "text-[10px]"} text-red-400 text-center leading-tight px-1`}>{card.character}</span>
                                                </>
                                            ) : isMe ? (
                                                <>
                                                    <span>{CHARACTER_ICONS[card.character]}</span>
                                                    <span className="text-xs mt-2 text-white text-center leading-tight px-1">{card.character}</span>
                                                </>
                                            ) : (
                                                <span className="opacity-20">?</span>
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
                                    {entry.message}
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
