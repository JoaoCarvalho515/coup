"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GameState, CharacterType } from "@/lib/game-logic";
import { AlertTriangle, Shield, Swords } from "lucide-react";
import Image from "next/image";

interface BlockChallengePanelProps {
    gameState: GameState;
    myPlayerId: string;
    onBlock: (character: CharacterType) => void;
    onChallenge: (targetPlayerId: string, character: CharacterType) => void;
    onPass: () => void;
}

const CHARACTER_IMAGES: Record<CharacterType, string> = {
    Duke: "/textures/duke.jpg",
    Assassin: "/textures/assassin.jpg",
    Captain: "/textures/captain.jpg",
    Ambassador: "/textures/ambassador.jpg",
    Contessa: "/textures/contessa.jpg",
};

export function BlockChallengePanel({
    gameState,
    myPlayerId,
    onBlock,
    onChallenge,
    onPass,
}: BlockChallengePanelProps) {
    const myPlayer = gameState.players.find(p => p.id === myPlayerId);

    if (!myPlayer || !myPlayer.isAlive) return null;

    // Block Window
    if (gameState.phase === 'block_window' && gameState.pendingAction) {
        const actor = gameState.players.find(p => p.id === gameState.pendingAction?.actorId);
        const target = gameState.pendingAction.targetId
            ? gameState.players.find(p => p.id === gameState.pendingAction?.targetId)
            : null;

        const canBlock = (gameState.pendingAction.type === 'foreign_aid' && gameState.pendingAction.actorId !== myPlayerId) ||
            (target && target.id === myPlayerId);

        if (!canBlock) {
            return (
                <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
                    <CardContent className="p-6 text-center">
                        <p className="text-slate-400">
                            Waiting for others to respond to <span className="font-bold text-white">{actor?.name}</span>&apos;s action...
                        </p>
                    </CardContent>
                </Card>
            );
        }

        return (
            <Card className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 backdrop-blur-sm border-2 border-yellow-500/50 animate-pulse">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-yellow-300">
                        <Shield className="size-5" />
                        Block Opportunity!
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-white">
                        <span className="font-bold">{actor?.name}</span> is attempting{" "}
                        <span className="font-bold text-yellow-400">{gameState.pendingAction.type.replace('_', ' ')}</span>
                        {target && (
                            <>
                                {" "}targeting <span className="font-bold">{target.name}</span>
                            </>
                        )}
                    </p>

                    <div className="space-y-2">
                        {gameState.pendingAction.type === 'foreign_aid' && (
                            <Button
                                onClick={() => onBlock('Duke')}
                                className="w-full bg-purple-600 hover:bg-purple-700 h-14 flex items-center justify-start gap-3 px-4"
                            >
                                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/50">
                                    <Image src={CHARACTER_IMAGES.Duke} alt="Duke" fill className="object-cover" />
                                </div>
                                <span className="font-bold">Block with Duke</span>
                            </Button>
                        )}

                        {gameState.pendingAction.type === 'assassinate' && target?.id === myPlayerId && (
                            <Button
                                onClick={() => onBlock('Contessa')}
                                className="w-full bg-red-600 hover:bg-red-700 h-14 flex items-center justify-start gap-3 px-4"
                            >
                                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/50">
                                    <Image src={CHARACTER_IMAGES.Contessa} alt="Contessa" fill className="object-cover" />
                                </div>
                                <span className="font-bold">Block with Contessa</span>
                            </Button>
                        )}

                        {gameState.pendingAction.type === 'steal' && target?.id === myPlayerId && (
                            <>
                                <Button
                                    onClick={() => onBlock('Captain')}
                                    className="w-full bg-cyan-600 hover:bg-cyan-700 h-14 flex items-center justify-start gap-3 px-4"
                                >
                                    <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/50">
                                        <Image src={CHARACTER_IMAGES.Captain} alt="Captain" fill className="object-cover" />
                                    </div>
                                    <span className="font-bold">Block with Captain</span>
                                </Button>
                                <Button
                                    onClick={() => onBlock('Ambassador')}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 h-14 flex items-center justify-start gap-3 px-4"
                                >
                                    <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/50">
                                        <Image src={CHARACTER_IMAGES.Ambassador} alt="Ambassador" fill className="object-cover" />
                                    </div>
                                    <span className="font-bold">Block with Ambassador</span>
                                </Button>
                            </>
                        )}

                        <Button
                            onClick={onPass}
                            variant="outline"
                            className="w-full border-slate-500 text-slate-400 hover:bg-slate-800"
                        >
                            Allow Action
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Challenge Window
    if (gameState.phase === 'challenge_window') {
        let targetPlayerId: string | undefined;
        let claimedCharacter: CharacterType | undefined;
        let actionDescription = "";

        if (gameState.pendingBlock) {
            // Someone blocked an action - they can be challenged
            targetPlayerId = gameState.pendingBlock.blockerId;
            claimedCharacter = gameState.pendingBlock.claimedCharacter;
            const blocker = gameState.players.find(p => p.id === targetPlayerId);
            actionDescription = `${blocker?.name} claims to have ${claimedCharacter} to block`;
        } else if (gameState.pendingAction?.claimedCharacter) {
            // Someone claimed a character for their action - they can be challenged
            targetPlayerId = gameState.pendingAction.actorId;
            claimedCharacter = gameState.pendingAction.claimedCharacter;
            const actor = gameState.players.find(p => p.id === targetPlayerId);
            actionDescription = `${actor?.name} claims to have ${claimedCharacter}`;
        }

        // Don't show panel if:
        // - No one to challenge (no character was claimed)
        // - I am the one being challenged (can't challenge myself)
        if (!targetPlayerId || !claimedCharacter || targetPlayerId === myPlayerId) {
            // Only show waiting message if there IS someone to challenge (just not me)
            if (targetPlayerId && claimedCharacter && targetPlayerId === myPlayerId) {
                return (
                    <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
                        <CardContent className="p-6 text-center">
                            <p className="text-slate-400">Waiting for others to challenge...</p>
                        </CardContent>
                    </Card>
                );
            }
            return null;
        }

        return (
            <Card className="bg-gradient-to-r from-red-900/30 to-pink-900/30 backdrop-blur-sm border-2 border-red-500/50 animate-pulse">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-300">
                        <Swords className="size-5" />
                        Challenge Opportunity!
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-red-500 flex-shrink-0 shadow-lg shadow-red-500/20">
                            <Image src={CHARACTER_IMAGES[claimedCharacter]} alt={claimedCharacter} fill className="object-cover" />
                        </div>
                        <div>
                            <p className="text-white mb-2 font-medium">{actionDescription}</p>
                            <p className="text-sm text-slate-400">
                                If you challenge and they don&apos;t have <span className="font-bold text-red-300">{claimedCharacter}</span>, they lose influence.
                                If they do have it, YOU lose influence!
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Button
                            onClick={() => onChallenge(targetPlayerId!, claimedCharacter!)}
                            className="w-full bg-red-600 hover:bg-red-700"
                        >
                            Challenge!
                        </Button>
                        <Button
                            onClick={onPass}
                            variant="outline"
                            className="w-full border-slate-500 text-slate-400 hover:bg-slate-800"
                        >
                            Allow
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return null;
}
