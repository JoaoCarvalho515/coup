"use client";

import { useCallback } from "react";
import { GameBoard } from "./game-board";
import { BlockChallengePanel } from "./block-challenge-panel";
import { CardSelector } from "./card-selector";
import { GameState, ActionType, CharacterType, ActionRequest, BlockRequest, ChallengeRequest } from "@/lib/game-logic";
import { useGameSounds } from "@/hooks/use-game-sounds";

interface GamePlayProps {
    gameState: GameState;
    playerName: string;
    myPlayerId: string;
    onAction: (action: ActionRequest) => void;
    onBlock: (block: BlockRequest) => void;
    onPassBlock: () => void;
    onChallenge: (challenge: ChallengeRequest) => void;
    onPassChallenge: () => void;
    onExchangeCards: (keptCardIds: string[]) => void;
    onLoseInfluence: (cardId: string) => void;
    onReturnToLobby: () => void;
    isHost: boolean;
    error?: string | null;
}

export function GamePlay({
    gameState,
    playerName,
    myPlayerId,
    onAction,
    onBlock,
    onPassBlock,
    onChallenge,
    onPassChallenge,
    onExchangeCards,
    onLoseInfluence,
    onReturnToLobby,
    isHost,
    error,
}: GamePlayProps) {
    // Initialize game sounds
    useGameSounds(gameState, myPlayerId);

    // Find my player ID from the player name
    const myPlayer = myPlayerId ? gameState.players.find(p => p.id === myPlayerId) : null;

    const handleAction = useCallback((action: ActionType, targetId?: string) => {
        if (!myPlayerId) return;
        onAction({
            type: action,
            actorId: myPlayerId,
            targetId,
        });
    }, [myPlayerId, onAction]);

    const handleBlock = useCallback((character: CharacterType) => {
        if (!myPlayerId || !gameState.pendingAction) return;
        onBlock({
            type: `block_${gameState.pendingAction.type}` as 'block_foreign_aid' | 'block_assassinate' | 'block_steal',
            blockerId: myPlayerId,
            claimedCharacter: character,
            targetActionId: gameState.pendingAction.actorId,
        });
    }, [myPlayerId, gameState.pendingAction, onBlock]);

    const handleChallenge = useCallback((targetPlayerId: string, character: CharacterType) => {
        if (!myPlayerId) return;
        onChallenge({
            challengerId: myPlayerId,
            targetPlayerId,
            claimedCharacter: character,
            isBlockChallenge: !!gameState.pendingBlock,
        });
    }, [myPlayerId, gameState.pendingBlock, onChallenge]);

    // Check if player needs to lose influence
    const needsToLoseInfluence = myPlayer &&
        gameState.phase === 'lose_influence' &&
        gameState.pendingInfluenceLoss === myPlayerId &&
        myPlayer.cards.filter(c => !c.revealed).length > 0;

    // Determine reason for influence loss
    let loseInfluenceDescription = "Choose one of your cards to reveal.";
    if (needsToLoseInfluence) {
        if (gameState.pendingChallenge) {
            if (gameState.pendingChallenge.challengerId === myPlayerId) {
                const targetName = gameState.players.find(p => p.id === gameState.pendingChallenge?.targetPlayerId)?.name;
                loseInfluenceDescription = `Your challenge against ${targetName} failed! You must lose an influence.`;
            } else {
                const challengerName = gameState.players.find(p => p.id === gameState.pendingChallenge?.challengerId)?.name;
                loseInfluenceDescription = `You were successfully challenged by ${challengerName}! You must lose an influence.`;
            }
        } else if (gameState.pendingAction) {
            const actorName = gameState.players.find(p => p.id === gameState.pendingAction?.actorId)?.name;
            if (gameState.pendingAction.type === 'coup') {
                loseInfluenceDescription = `You were Couped by ${actorName}! You must lose an influence.`;
            } else if (gameState.pendingAction.type === 'assassinate') {
                loseInfluenceDescription = `You were Assassinated by ${actorName}! You must lose an influence.`;
            }
        }
    }

    // Check if player needs to exchange cards (Ambassador)
    const needsToExchange = myPlayer &&
        gameState.phase === 'exchange' &&
        gameState.pendingExchangeCards &&
        myPlayerId === gameState.pendingAction?.actorId;

    if (!myPlayerId) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-xl text-muted-foreground">Loading game...</p>
            </div>
        );
    }

    return (
        <div className="relative">
            <GameBoard
                gameState={gameState}
                myPlayerId={myPlayerId}
                onAction={handleAction}
                onReturnToLobby={onReturnToLobby}
                isHost={isHost}
            />

            {/* Block/Challenge Panel - Overlay */}
            {(gameState.phase === 'block_window' || gameState.phase === 'challenge_window') && (
                <div className="fixed bottom-4 left-4 right-4 z-40 max-w-2xl mx-auto">
                    <BlockChallengePanel
                        gameState={gameState}
                        myPlayerId={myPlayerId}
                        onBlock={handleBlock}
                        onChallenge={handleChallenge}
                        onPass={() => {
                            if (gameState.phase === 'block_window') {
                                onPassBlock();
                            } else {
                                onPassChallenge();
                            }
                        }}
                    />
                </div>
            )}

            {/* Card Exchange Modal */}
            {needsToExchange && gameState.pendingExchangeCards && (
                <CardSelector
                    cards={[...myPlayer!.cards, ...gameState.pendingExchangeCards]}
                    title="Exchange Cards"
                    description={`Choose ${myPlayer!.cards.filter(c => !c.revealed).length} cards to keep. The rest will be returned to the deck.`}
                    selectCount={myPlayer!.cards.filter(c => !c.revealed).length}
                    onConfirm={onExchangeCards}
                />
            )}

            {/* Lose Influence Modal */}
            {needsToLoseInfluence && (
                <CardSelector
                    key={`lose-influence-${myPlayer!.cards.filter(c => !c.revealed).length}`}
                    cards={myPlayer!.cards}
                    title="Lose Influence"
                    description={loseInfluenceDescription}
                    selectCount={1}
                    onConfirm={(cardIds) => onLoseInfluence(cardIds[0])}
                />
            )}

            {/* Error Display */}
            {error && (
                <div className="fixed top-4 right-4 z-50 p-4 bg-red-900 text-white rounded-lg shadow-lg max-w-md">
                    {error}
                </div>
            )}
        </div>
    );
}
