import { supabase } from './supabase'
import type { Database } from './database.types'

type Game = Database['public']['Tables']['games']['Row']
type GameInsert = Database['public']['Tables']['games']['Insert']

/**
 * Generate a unique 6-character game code
 */
export function generateGameCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
}

/**
 * Create a new game with a unique code
 * All game logic is handled client-side
 */
export async function createGame(code?: string) {
    const gameCode = code || generateGameCode()

    const gameData: GameInsert = {
        code: gameCode,
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
        .select('*')
        .eq('code', code)
        .single()

    if (error) throw error
    return data
}

/**
 * Get game by ID
 */
export async function getGameById(gameId: string) {
    const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single()

    if (error) throw error
    return data
}

/**
 * Check if a game code exists
 */
export async function gameCodeExists(code: string): Promise<boolean> {
    const { data, error } = await supabase
        .from('games')
        .select('id')
        .eq('code', code)
        .single()

    return !error && data !== null
}
