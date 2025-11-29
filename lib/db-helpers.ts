import { supabase } from './supabase'
import type { Database } from './database.types'
import type { CharacterType, GamePhase } from './game-logic'

type Game = Database['public']['Tables']['games']['Row']
type GameInsert = Database['public']['Tables']['games']['Insert']
type Player = Database['public']['Tables']['players']['Row']
type PlayerInsert = Database['public']['Tables']['players']['Insert']
type Card = Database['public']['Tables']['cards']['Row']
type CardInsert = Database['public']['Tables']['cards']['Insert']
type GameAction = Database['public']['Tables']['game_actions']['Row']
type GameActionInsert = Database['public']['Tables']['game_actions']['Insert']

/**
 * Generate a unique 6-character game code
 */
export function generateGameCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
}

/**
 * Create a new game
 */
export async function createGame(code: string) {
    const gameData: GameInsert = {
        code,
        status: 'waiting',
        phase: 'waiting',
        current_player_index: 0,
    }

    const { data, error } = await supabase
        .from('games')
        .insert(gameData)
        .select()
        .single()

    if (error) throw error
    return data
}

/**
 * Get game by code
 */
export async function getGameByCode(code: string) {
    const { data, error } = await supabase
        .from('games')
        .select(`
      *,
      players (
        *,
        cards (*)
      )
    `)
        .eq('code', code)
        .single()

    if (error) throw error
    return data
}

/**
 * Get game by ID with all related data
 */
export async function getGameById(gameId: string) {
    const { data, error } = await supabase
        .from('games')
        .select(`
      *,
      players (
        *,
        cards (*)
      ),
      pending_actions (*),
      game_actions (*)
    `)
        .eq('id', gameId)
        .single()

    if (error) throw error
    return data
}

/**
 * Add a player to a game
 */
export async function addPlayerToGame(
    gameId: string,
    playerName: string,
    playerOrder: number,
    userId?: string
) {
    const playerData: PlayerInsert = {
        game_id: gameId,
        name: playerName,
        player_order: playerOrder,
        user_id: userId,
        coins: 2,
        is_alive: true,
    }

    const { data, error } = await supabase
        .from('players')
        .insert(playerData)
        .select()
        .single()

    if (error) throw error
    return data
}

/**
 * Create initial deck for a game
 */
export async function createDeck(gameId: string) {
    const characters: CharacterType[] = ['Duke', 'Assassin', 'Captain', 'Ambassador', 'Contessa']
    const cards: CardInsert[] = []

    // Create 3 of each character
    characters.forEach((character) => {
        for (let i = 0; i < 3; i++) {
            cards.push({
                game_id: gameId,
                character,
                location: 'court_deck',
                revealed: false,
            })
        }
    })

    // Shuffle the cards
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
            ;[cards[i], cards[j]] = [cards[j], cards[i]]
    }

    // Assign card order
    cards.forEach((card, index) => {
        card.card_order = index
    })

    const { data, error } = await supabase.from('cards').insert(cards).select()

    if (error) throw error
    return data
}

/**
 * Deal cards to a player
 */
export async function dealCardsToPlayer(gameId: string, playerId: string, count: number = 2) {
    // Get cards from court deck
    const { data: deckCards, error: fetchError } = await supabase
        .from('cards')
        .select('*')
        .eq('game_id', gameId)
        .eq('location', 'court_deck')
        .order('card_order')
        .limit(count)

    if (fetchError) throw fetchError
    if (!deckCards || deckCards.length < count) {
        throw new Error('Not enough cards in deck')
    }

    // Update cards to assign them to player
    const { data, error } = await supabase
        .from('cards')
        .update({
            player_id: playerId,
            location: 'player_hand',
        })
        .in(
            'id',
            deckCards.map((c) => c.id)
        )
        .select()

    if (error) throw error
    return data
}

/**
 * Update game status and phase
 */
export async function updateGameState(
    gameId: string,
    updates: {
        status?: 'waiting' | 'active' | 'completed'
        phase?: GamePhase
        current_player_index?: number
        winner_id?: string
    }
) {
    const { data, error } = await supabase
        .from('games')
        .update(updates)
        .eq('id', gameId)
        .select()
        .single()

    if (error) throw error
    return data
}

/**
 * Log a game action
 */
export async function logGameAction(
    gameId: string,
    playerId: string,
    actionType: string,
    targetPlayerId?: string,
    claimedCharacter?: string,
    result?: string
) {
    const actionData: GameActionInsert = {
        game_id: gameId,
        player_id: playerId,
        action_type: actionType,
        target_player_id: targetPlayerId,
        claimed_character: claimedCharacter,
        result,
    }

    const { data, error } = await supabase
        .from('game_actions')
        .insert(actionData)
        .select()
        .single()

    if (error) throw error
    return data
}

/**
 * Update player coins
 */
export async function updatePlayerCoins(playerId: string, coins: number) {
    const { data, error } = await supabase
        .from('players')
        .update({ coins })
        .eq('id', playerId)
        .select()
        .single()

    if (error) throw error
    return data
}

/**
 * Reveal a card (lose influence)
 */
export async function revealCard(cardId: string) {
    const { data, error } = await supabase
        .from('cards')
        .update({
            revealed: true,
            location: 'discard_pile',
        })
        .eq('id', cardId)
        .select()
        .single()

    if (error) throw error
    return data
}

/**
 * Get players in a game
 */
export async function getPlayersInGame(gameId: string) {
    const { data, error } = await supabase
        .from('players')
        .select('*, cards(*)')
        .eq('game_id', gameId)
        .order('player_order')

    if (error) throw error
    return data
}

/**
 * Start a game
 */
export async function startGame(gameId: string) {
    const { data: game, error: gameError } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single()

    if (gameError) throw gameError

    // Create and shuffle deck
    await createDeck(gameId)

    // Deal cards to all players
    const players = await getPlayersInGame(gameId)

    for (const player of players) {
        await dealCardsToPlayer(gameId, player.id, 2)
    }

    // Update game status
    return updateGameState(gameId, {
        status: 'active',
        phase: 'action',
        current_player_index: 0,
    })
}
