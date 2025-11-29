# Coup Game Database Schema

## Overview
The database is simplified to only store game codes. All game logic (players, cards, turns, actions) is handled entirely on the client-side.

## Database Tables

### `games`
Stores only the game join codes.

**Columns:**
- `id` (uuid, PK): Unique game identifier
- `code` (text, unique): 6-character join code for players to join the game
- `created_at` (timestamptz): Timestamp when game was created

## Design Philosophy

This schema follows a **minimal backend** approach where:
- The database only facilitates game discovery via join codes
- All game state (players, cards, coins, turns, etc.) is managed client-side
- Game logic and rules are implemented in `lib/game-logic.ts`
- Real-time synchronization can be handled via WebRTC, WebSockets, or similar peer-to-peer technologies

## Row Level Security (RLS)

Simple public access policies:

### Games
- Anyone can view games (SELECT)
- Anyone can create games (INSERT)

## Helper Functions

See `lib/db-helpers.ts` for utility functions:
- `generateGameCode()` - Generate unique 6-character code
- `createGame(code?)` - Create new game with optional custom code
- `getGameByCode(code)` - Find game by join code
- `getGameById(gameId)` - Find game by ID
- `gameCodeExists(code)` - Check if a code is already in use

## TypeScript Types

Generated types available in `lib/database.types.ts` and typed Supabase client in `lib/supabase.ts`.

## Client-Side Game Logic

All game mechanics are implemented in `lib/game-logic.ts`:
- Player management
- Card deck and dealing
- Turn order
- Actions (income, foreign aid, coup, tax, assassinate, steal, exchange)
- Blocking and challenging
- Influence tracking
- Win conditions

## Next Steps

1. Implement client-side state management (React Context, Zustand, or similar)
2. Set up peer-to-peer communication for game synchronization
3. Build UI components for game creation and joining
4. Implement game flow using client-side logic
