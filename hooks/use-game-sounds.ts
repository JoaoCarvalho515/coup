import useSound from 'use-sound';
import { useEffect, useRef } from 'react';
import { GameState } from '@/lib/game-logic';

export function useGameSounds(gameState: GameState | null, myPlayerId: string) {
    // Sounds
    const [playPlay] = useSound('/sounds/play.mp3');
    const [playBlock] = useSound('/sounds/block.mp3');
    const [playChallenge] = useSound('/sounds/i_challenge_you.mp3');

    const lastLogTimestampRef = useRef<number>(0);
    const lastTurnRef = useRef<number>(0);

    useEffect(() => {
        if (!gameState) return;

        // Handle Turn Change (Update ref but no sound)
        if (gameState.turn !== lastTurnRef.current) {
            lastTurnRef.current = gameState.turn;
        }

        // Handle Action Sounds from Logs
        const newLogs = gameState.log.filter(log => log.timestamp > lastLogTimestampRef.current);

        if (newLogs.length > 0) {
            lastLogTimestampRef.current = newLogs[newLogs.length - 1].timestamp;

            newLogs.forEach(log => {
                // Handle Action Sounds
                if (log.actionType) {
                    const isInitiation = log.message.includes('claims') || log.message.includes('attempts');

                    // Play generic sound for all actions (Income, Coup, or initiation of others)
                    if (log.actionType === 'income' || log.actionType === 'coup' || isInitiation) {
                        playPlay();
                    }
                }

                // Handle Other Game Events
                if (log.message.includes(' to block')) {
                    playBlock();
                } else if (log.message.includes('challenges')) {
                    playChallenge();
                } else if (log.message.includes('loses influence')) {
                    playPlay();
                }
            });
        }
    }, [
        gameState,
        myPlayerId,
        playPlay,
        playBlock,
        playChallenge
    ]);
}
