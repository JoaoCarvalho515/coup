/**
 * Coup Game Logic
 * This file contains all the game logic for the Coup card game
 */

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export type CharacterType = 'Duke' | 'Assassin' | 'Captain' | 'Ambassador' | 'Contessa';

export type ActionType =
    | 'income'
    | 'foreign_aid'
    | 'coup'
    | 'tax'
    | 'assassinate'
    | 'steal'
    | 'exchange';

export type BlockType = 'block_foreign_aid' | 'block_assassinate' | 'block_steal';

export interface Card {
    id: string;
    character: CharacterType;
    revealed: boolean;
}

export interface Player {
    id: string;
    name: string;
    coins: number;
    cards: Card[];
    isAlive: boolean;
}

export interface ActionRequest {
    type: ActionType;
    actorId: string;
    targetId?: string;
    claimedCharacter?: CharacterType;
}

export interface BlockRequest {
    type: BlockType;
    blockerId: string;
    claimedCharacter: CharacterType;
    targetActionId: string;
}

export interface ChallengeRequest {
    challengerId: string;
    targetPlayerId: string;
    claimedCharacter: CharacterType;
    isBlockChallenge: boolean;
}

export interface GameState {
    id: string;
    players: Player[];
    currentPlayerIndex: number;
    courtDeck: Card[];
    discardPile: Card[];
    phase: GamePhase;
    pendingAction: ActionRequest | null;
    pendingBlock: BlockRequest | null;
    pendingChallenge: ChallengeRequest | null;
    pendingExchangeCards: Card[] | null;
    winner: string | null;
    log: GameLogEntry[];
}

export type GamePhase =
    | 'waiting'        // Waiting for players to join
    | 'action'         // Current player must choose an action
    | 'block_window'   // Other players can block the action
    | 'challenge_window' // Players can challenge action or block
    | 'resolving'      // Resolving action/challenge/block
    | 'exchange'       // Ambassador is choosing cards to exchange
    | 'game_over';

export interface GameLogEntry {
    timestamp: number;
    message: string;
    playerId?: string;
    actionType?: string;
}

// ============================================================================
// CHARACTER ABILITIES
// ============================================================================

export const CHARACTER_ACTIONS: Record<CharacterType, ActionType | null> = {
    Duke: 'tax',
    Assassin: 'assassinate',
    Captain: 'steal',
    Ambassador: 'exchange',
    Contessa: null, // Contessa only blocks
};

export const ACTION_REQUIREMENTS: Record<ActionType, {
    character?: CharacterType;
    cost?: number;
    needsTarget?: boolean;
    canBeBlocked?: boolean;
    blockingCharacters?: CharacterType[];
}> = {
    income: {},
    foreign_aid: {
        canBeBlocked: true,
        blockingCharacters: ['Duke'],
    },
    coup: {
        cost: 7,
        needsTarget: true,
    },
    tax: {
        character: 'Duke',
    },
    assassinate: {
        character: 'Assassin',
        cost: 3,
        needsTarget: true,
        canBeBlocked: true,
        blockingCharacters: ['Contessa'],
    },
    steal: {
        character: 'Captain',
        needsTarget: true,
        canBeBlocked: true,
        blockingCharacters: ['Captain', 'Ambassador'],
    },
    exchange: {
        character: 'Ambassador',
    },
};

// ============================================================================
// GAME INITIALIZATION
// ============================================================================

export function createDeck(): Card[] {
    const characters: CharacterType[] = ['Duke', 'Assassin', 'Captain', 'Ambassador', 'Contessa'];
    const deck: Card[] = [];

    characters.forEach((character, charIndex) => {
        for (let i = 0; i < 3; i++) {
            deck.push({
                id: `${character}-${i}`,
                character,
                revealed: false,
            });
        }
    });

    return shuffleDeck(deck);
}

export function shuffleDeck(deck: Card[]): Card[] {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export function initializeGame(playerNames: string[]): GameState {
    if (playerNames.length < 2 || playerNames.length > 6) {
        throw new Error('Game requires 2-6 players');
    }

    const deck = createDeck();
    const players: Player[] = [];

    // Deal 2 cards to each player
    playerNames.forEach((name, index) => {
        const playerCards = [deck.pop()!, deck.pop()!];
        players.push({
            id: `player-${index}`,
            name,
            coins: 2,
            cards: playerCards,
            isAlive: true,
        });
    });

    return {
        id: `game-${Date.now()}`,
        players,
        currentPlayerIndex: 0,
        courtDeck: deck,
        discardPile: [],
        phase: 'action',
        pendingAction: null,
        pendingBlock: null,
        pendingChallenge: null,
        pendingExchangeCards: null,
        winner: null,
        log: [{
            timestamp: Date.now(),
            message: 'Game started',
        }],
    };
}

// ============================================================================
// GAME STATE QUERIES
// ============================================================================

export function getCurrentPlayer(state: GameState): Player {
    return state.players[state.currentPlayerIndex];
}

export function getPlayer(state: GameState, playerId: string): Player | undefined {
    return state.players.find(p => p.id === playerId);
}

export function getAlivePlayers(state: GameState): Player[] {
    return state.players.filter(p => p.isAlive);
}

export function getPlayerInfluence(player: Player): number {
    return player.cards.filter(c => !c.revealed).length;
}

export function isPlayerAlive(player: Player): boolean {
    return getPlayerInfluence(player) > 0;
}

export function getWinner(state: GameState): Player | null {
    const alivePlayers = getAlivePlayers(state);
    return alivePlayers.length === 1 ? alivePlayers[0] : null;
}

// ============================================================================
// ACTION VALIDATION
// ============================================================================

export function canPerformAction(
    state: GameState,
    playerId: string,
    action: ActionType,
    targetId?: string
): { valid: boolean; reason?: string } {
    const player = getPlayer(state, playerId);
    if (!player) return { valid: false, reason: 'Player not found' };
    if (!player.isAlive) return { valid: false, reason: 'Player is eliminated' };
    if (getCurrentPlayer(state).id !== playerId) {
        return { valid: false, reason: 'Not your turn' };
    }
    if (state.phase !== 'action') {
        return { valid: false, reason: 'Not in action phase' };
    }

    const requirements = ACTION_REQUIREMENTS[action];

    // Check coin cost
    if (requirements.cost && player.coins < requirements.cost) {
        return { valid: false, reason: 'Not enough coins' };
    }

    // Check if must coup with 10+ coins
    if (player.coins >= 10 && action !== 'coup') {
        return { valid: false, reason: 'Must coup with 10 or more coins' };
    }

    // Check target requirement
    if (requirements.needsTarget && !targetId) {
        return { valid: false, reason: 'Action requires a target' };
    }

    if (targetId) {
        const target = getPlayer(state, targetId);
        if (!target || !target.isAlive) {
            return { valid: false, reason: 'Invalid target' };
        }
        if (target.id === playerId) {
            return { valid: false, reason: 'Cannot target yourself' };
        }
    }

    return { valid: true };
}

export function canBlock(
    state: GameState,
    playerId: string,
    character: CharacterType
): { valid: boolean; reason?: string } {
    if (state.phase !== 'block_window') {
        return { valid: false, reason: 'Not in block window' };
    }
    if (!state.pendingAction) {
        return { valid: false, reason: 'No pending action to block' };
    }

    const player = getPlayer(state, playerId);
    if (!player || !player.isAlive) {
        return { valid: false, reason: 'Player not found or eliminated' };
    }

    const requirements = ACTION_REQUIREMENTS[state.pendingAction.type];
    if (!requirements.canBeBlocked) {
        return { valid: false, reason: 'Action cannot be blocked' };
    }

    if (!requirements.blockingCharacters?.includes(character)) {
        return { valid: false, reason: `${character} cannot block this action` };
    }

    // Check if player is the target (for targeted actions) or any player (for foreign aid)
    if (state.pendingAction.type !== 'foreign_aid' &&
        state.pendingAction.targetId !== playerId) {
        return { valid: false, reason: 'Only the target can block this action' };
    }

    return { valid: true };
}

export function canChallenge(
    state: GameState,
    challengerId: string,
    targetPlayerId: string
): { valid: boolean; reason?: string } {
    const challenger = getPlayer(state, challengerId);
    if (!challenger || !challenger.isAlive) {
        return { valid: false, reason: 'Challenger not found or eliminated' };
    }

    if (challengerId === targetPlayerId) {
        return { valid: false, reason: 'Cannot challenge yourself' };
    }

    if (state.phase !== 'challenge_window' && state.phase !== 'block_window') {
        return { valid: false, reason: 'Not in challenge phase' };
    }

    return { valid: true };
}

// ============================================================================
// ACTION EXECUTION
// ============================================================================

export function performAction(state: GameState, action: ActionRequest): GameState {
    const validation = canPerformAction(state, action.actorId, action.type, action.targetId);
    if (!validation.valid) {
        throw new Error(validation.reason);
    }

    const newState = { ...state };
    const actor = getPlayer(newState, action.actorId)!;

    // Deduct cost if any
    const requirements = ACTION_REQUIREMENTS[action.type];
    if (requirements.cost) {
        actor.coins -= requirements.cost;
    }

    // Set claimed character for character actions
    if (requirements.character) {
        action.claimedCharacter = requirements.character;
    }

    newState.pendingAction = action;

    // Actions that can be challenged or blocked go to appropriate window
    if (requirements.character || requirements.canBeBlocked) {
        if (requirements.canBeBlocked) {
            newState.phase = 'block_window';
            addLog(newState, `${actor.name} attempts ${action.type}`, action.actorId, action.type);
        } else {
            newState.phase = 'challenge_window';
            addLog(newState, `${actor.name} claims ${requirements.character} to ${action.type}`, action.actorId, action.type);
        }
    } else {
        // Income and Coup resolve immediately
        resolveAction(newState);
    }

    return newState;
}

export function resolveAction(state: GameState): void {
    if (!state.pendingAction) return;

    const action = state.pendingAction;
    const actor = getPlayer(state, action.actorId)!;
    const target = action.targetId ? getPlayer(state, action.targetId) : null;

    switch (action.type) {
        case 'income':
            actor.coins += 1;
            addLog(state, `${actor.name} takes 1 coin (Income)`, actor.id, action.type);
            break;

        case 'foreign_aid':
            actor.coins += 2;
            addLog(state, `${actor.name} takes 2 coins (Foreign Aid)`, actor.id, action.type);
            break;

        case 'coup':
            if (target) {
                loseInfluence(state, target.id);
                addLog(state, `${actor.name} coups ${target.name}`, actor.id, action.type);
            }
            break;

        case 'tax':
            actor.coins += 3;
            addLog(state, `${actor.name} takes 3 coins (Tax)`, actor.id, action.type);
            break;

        case 'assassinate':
            if (target) {
                loseInfluence(state, target.id);
                addLog(state, `${actor.name} assassinates ${target.name}`, actor.id, action.type);
            }
            break;

        case 'steal':
            if (target) {
                const stolen = Math.min(2, target.coins);
                target.coins -= stolen;
                actor.coins += stolen;
                addLog(state, `${actor.name} steals ${stolen} coins from ${target.name}`, actor.id, action.type);
            }
            break;

        case 'exchange':
            // Exchange requires player to choose cards, so we enter exchange phase
            // Draw 2 cards from deck
            const drawnCards: Card[] = [];
            for (let i = 0; i < 2 && state.courtDeck.length > 0; i++) {
                drawnCards.push(state.courtDeck.pop()!);
            }
            state.pendingExchangeCards = drawnCards;
            state.phase = 'exchange';
            addLog(state, `${actor.name} exchanges cards`, actor.id, action.type);
            return; // Don't end turn yet
    }

    state.pendingAction = null;
    endTurn(state);
}

export function blockAction(state: GameState, block: BlockRequest): GameState {
    const validation = canBlock(state, block.blockerId, block.claimedCharacter);
    if (!validation.valid) {
        throw new Error(validation.reason);
    }

    const newState = { ...state };
    const blocker = getPlayer(newState, block.blockerId)!;

    newState.pendingBlock = block;
    newState.phase = 'challenge_window';

    addLog(newState, `${blocker.name} claims ${block.claimedCharacter} to block`, block.blockerId);

    return newState;
}

export function passBlock(state: GameState): GameState {
    const newState = { ...state };

    if (newState.phase === 'block_window') {
        // No one blocked, proceed to resolve action
        newState.phase = 'resolving';
        resolveAction(newState);
    }

    return newState;
}

// ============================================================================
// CHALLENGE SYSTEM
// ============================================================================

export function challengeAction(
    state: GameState,
    challenge: ChallengeRequest
): GameState {
    const validation = canChallenge(state, challenge.challengerId, challenge.targetPlayerId);
    if (!validation.valid) {
        throw new Error(validation.reason);
    }

    const newState = { ...state };
    const challenger = getPlayer(newState, challenge.challengerId)!;
    const target = getPlayer(newState, challenge.targetPlayerId)!;

    addLog(newState, `${challenger.name} challenges ${target.name}'s ${challenge.claimedCharacter}`, challenge.challengerId);

    // Check if target has the claimed character
    const hasCharacter = target.cards.some(
        card => !card.revealed && card.character === challenge.claimedCharacter
    );

    if (hasCharacter) {
        // Challenge failed - challenger loses influence
        addLog(newState, `${target.name} reveals ${challenge.claimedCharacter}! Challenge failed.`, target.id);
        loseInfluence(newState, challenger.id);

        // Target reveals and shuffles back the card
        const cardIndex = target.cards.findIndex(
            card => !card.revealed && card.character === challenge.claimedCharacter
        );
        if (cardIndex !== -1) {
            const revealedCard = target.cards[cardIndex];
            target.cards.splice(cardIndex, 1);
            newState.courtDeck.push(revealedCard);
            newState.courtDeck = shuffleDeck(newState.courtDeck);

            // Draw a new card
            if (newState.courtDeck.length > 0) {
                target.cards.push(newState.courtDeck.pop()!);
            }
        }

        // If challenging a block, the action goes through
        if (challenge.isBlockChallenge) {
            // Block challenge failed, so block stands. Action is blocked.
            newState.pendingBlock = null;
            newState.pendingAction = null;
            endTurn(newState);
        } else {
            // Action succeeds
            resolveAction(newState);
        }
    } else {
        // Challenge succeeded - target loses influence
        addLog(newState, `${target.name} doesn't have ${challenge.claimedCharacter}! Challenge succeeded.`, target.id);
        loseInfluence(newState, target.id);

        // If challenging a block, the block fails and action goes through
        if (challenge.isBlockChallenge) {
            newState.pendingBlock = null;
            resolveAction(newState);
        } else {
            // Action fails
            newState.pendingAction = null;
            endTurn(newState);
        }
    }

    return newState;
}

export function passChallenge(state: GameState): GameState {
    const newState = { ...state };

    if (newState.phase === 'challenge_window') {
        // No one challenged
        if (newState.pendingBlock) {
            // Block succeeds, action is cancelled
            const blocker = getPlayer(newState, newState.pendingBlock.blockerId)!;
            addLog(newState, `${blocker.name}'s block succeeds`, newState.pendingBlock.blockerId);
            newState.pendingBlock = null;
            newState.pendingAction = null;
            endTurn(newState);
        } else {
            // Action succeeds
            resolveAction(newState);
        }
    }

    return newState;
}

// ============================================================================
// INFLUENCE MANAGEMENT
// ============================================================================

export function loseInfluence(state: GameState, playerId: string, cardId?: string): void {
    const player = getPlayer(state, playerId);
    if (!player) return;

    // If cardId specified, reveal that card; otherwise reveal first unrevealed card
    let card: Card | undefined;
    if (cardId) {
        card = player.cards.find(c => c.id === cardId && !c.revealed);
    } else {
        card = player.cards.find(c => !c.revealed);
    }

    if (card) {
        card.revealed = true;
        addLog(state, `${player.name} loses influence (${card.character})`, playerId);

        // Check if player is eliminated
        if (getPlayerInfluence(player) === 0) {
            player.isAlive = false;
            addLog(state, `${player.name} is eliminated`, playerId);

            // Check for winner
            const alivePlayers = getAlivePlayers(state);
            if (alivePlayers.length === 1) {
                state.winner = alivePlayers[0].id;
                state.phase = 'game_over';
                addLog(state, `${alivePlayers[0].name} wins!`, alivePlayers[0].id);
            }
        }
    }
}

export function exchangeCards(
    state: GameState,
    playerId: string,
    keptCardIds: string[]
): GameState {
    if (state.phase !== 'exchange') {
        throw new Error('Not in exchange phase');
    }

    const newState = { ...state };
    const player = getPlayer(newState, playerId);
    if (!player || player.id !== getCurrentPlayer(newState).id) {
        throw new Error('Invalid player for exchange');
    }

    // Get cards from pending exchange
    const drawnCards = newState.pendingExchangeCards || [];

    // Combine current cards with drawn cards
    const allCards = [...player.cards.filter(c => !c.revealed), ...drawnCards];

    // Keep the specified cards
    const keptCards = allCards.filter(c => keptCardIds.includes(c.id));
    const returnedCards = allCards.filter(c => !keptCardIds.includes(c.id));

    if (keptCards.length !== getPlayerInfluence(player)) {
        throw new Error('Must keep the same number of cards as current influence');
    }

    // Update player's cards
    player.cards = [...keptCards, ...player.cards.filter(c => c.revealed)];

    // Return other cards to deck
    newState.courtDeck.push(...returnedCards);
    newState.courtDeck = shuffleDeck(newState.courtDeck);

    newState.pendingAction = null;
    newState.pendingExchangeCards = null;
    endTurn(newState);

    return newState;
}

// ============================================================================
// TURN MANAGEMENT
// ============================================================================

export function endTurn(state: GameState): void {
    // Move to next alive player
    const alivePlayers = getAlivePlayers(state);
    if (alivePlayers.length <= 1) {
        state.phase = 'game_over';
        return;
    }

    let nextIndex = (state.currentPlayerIndex + 1) % state.players.length;
    while (!state.players[nextIndex].isAlive) {
        nextIndex = (nextIndex + 1) % state.players.length;
    }

    state.currentPlayerIndex = nextIndex;
    state.phase = 'action';
    state.pendingAction = null;
    state.pendingBlock = null;
    state.pendingChallenge = null;

    // Check if deck needs reshuffling
    if (state.courtDeck.length === 0 && state.discardPile.length > 0) {
        state.courtDeck = shuffleDeck([...state.discardPile]);
        state.discardPile = [];
        addLog(state, 'Court deck reshuffled');
    }
}

// ============================================================================
// UTILITIES
// ============================================================================

export function addLog(
    state: GameState,
    message: string,
    playerId?: string,
    actionType?: string
): void {
    state.log.push({
        timestamp: Date.now(),
        message,
        playerId,
        actionType,
    });
}

export function getGameSummary(state: GameState): string {
    const currentPlayer = getCurrentPlayer(state);
    const alivePlayers = getAlivePlayers(state);

    return `Game ${state.id} - Phase: ${state.phase} - Current: ${currentPlayer.name} - Alive: ${alivePlayers.length}`;
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export const GameLogic = {
    // Initialization
    createDeck,
    shuffleDeck,
    initializeGame,

    // Queries
    getCurrentPlayer,
    getPlayer,
    getAlivePlayers,
    getPlayerInfluence,
    isPlayerAlive,
    getWinner,

    // Validation
    canPerformAction,
    canBlock,
    canChallenge,

    // Actions
    performAction,
    resolveAction,
    blockAction,
    passBlock,

    // Challenges
    challengeAction,
    passChallenge,

    // Influence
    loseInfluence,
    exchangeCards,

    // Turn management
    endTurn,

    // Utilities
    addLog,
    getGameSummary,
};
