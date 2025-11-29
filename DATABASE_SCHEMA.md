# Coup Game Database Schema

## Overview
The database is designed to support a multiplayer Coup card game with real-time gameplay, tracking game state, players, cards, and actions.

## Database Tables

### 1. `games`
Stores game metadata and current state.

**Columns:**
- `id` (uuid, PK): Unique game identifier
- `code` (text, unique): 6-character join code
- `status` (text): Game status - 'waiting', 'active', 'completed'
- `phase` (text): Current game phase - 'waiting', 'action', 'block_window', 'challenge_window', 'resolving', 'exchange', 'game_over'
- `current_player_index` (integer): Index of current player's turn
- `winner_id` (uuid, FK): ID of winning player
- `created_at`, `updated_at` (timestamptz): Timestamps

### 2. `players`
Stores player information within each game.

**Columns:**
- `id` (uuid, PK): Unique player identifier
- `game_id` (uuid, FK): Reference to game
- `user_id` (uuid, FK): Reference to authenticated user (optional)
- `name` (text): Player display name
- `coins` (integer): Number of coins (starts at 2)
- `is_alive` (boolean): Whether player is still in game
- `player_order` (integer): Turn order position
- `created_at`, `updated_at` (timestamptz): Timestamps

### 3. `cards`
Stores all cards in the game with their current location.

**Columns:**
- `id` (uuid, PK): Unique card identifier
- `game_id` (uuid, FK): Reference to game
- `player_id` (uuid, FK): Reference to player (if in hand)
- `character` (text): Card type - 'Duke', 'Assassin', 'Captain', 'Ambassador', 'Contessa'
- `location` (text): Current location - 'player_hand', 'court_deck', 'discard_pile'
- `revealed` (boolean): Whether card has been revealed
- `card_order` (integer): Position in deck/hand
- `created_at`, `updated_at` (timestamptz): Timestamps

### 4. `game_actions`
Logs all actions taken during the game.

**Columns:**
- `id` (uuid, PK): Unique action identifier
- `game_id` (uuid, FK): Reference to game
- `player_id` (uuid, FK): Player who took action
- `action_type` (text): Type of action - 'income', 'foreign_aid', 'coup', 'tax', 'assassinate', 'steal', 'exchange', 'block', 'challenge'
- `target_player_id` (uuid, FK): Target of action (if applicable)
- `claimed_character` (text): Character claimed for action
- `result` (text): Outcome of action
- `created_at` (timestamptz): Timestamp

### 5. `pending_actions`
Stores current pending action/block/challenge (one per game).

**Columns:**
- `id` (uuid, PK): Unique identifier
- `game_id` (uuid, FK, unique): Reference to game
- `action_type` (text): Type of pending action
- `actor_id` (uuid, FK): Player performing action
- `target_id` (uuid, FK): Target player (if applicable)
- `claimed_character` (text): Character claimed
- `is_block` (boolean): Whether this is a block
- `blocker_id` (uuid, FK): Player blocking (if applicable)
- `is_challenge` (boolean): Whether this is a challenge
- `challenger_id` (uuid, FK): Player challenging (if applicable)
- `created_at` (timestamptz): Timestamp

## Row Level Security (RLS)

All tables have RLS enabled with the following policies:

### Games
- Anyone can view and create games
- Only players in the game can update it

### Players
- Anyone can view and create players
- Players can update their own records

### Cards
- Players can view cards in their game
- System has full access for game mechanics

### Game Actions
- Players can view actions in their game
- Players can create actions in their game

### Pending Actions
- Players can view pending actions in their game
- System has full access for game mechanics

## Indexes

Performance indexes created on:
- `games.code` - for quick game lookup by join code
- `games.status` - for filtering active games
- `players.game_id` - for player queries by game
- `cards.game_id`, `cards.player_id` - for card queries
- `game_actions.game_id` - for action history

## Helper Functions

See `lib/db-helpers.ts` for utility functions:
- `createGame()` - Create new game
- `getGameByCode()` - Find game by join code
- `addPlayerToGame()` - Add player to game
- `createDeck()` - Initialize card deck
- `dealCardsToPlayer()` - Deal cards to player
- `startGame()` - Start game and deal initial cards
- `updateGameState()` - Update game phase/status
- `logGameAction()` - Log player actions
- `revealCard()` - Reveal a card (lose influence)

## TypeScript Types

Generated types available in `lib/database.types.ts` and typed Supabase client in `lib/supabase.ts`.

## Next Steps

1. Implement real-time subscriptions for live game updates
2. Create API routes for game actions
3. Build UI components for game creation and joining
4. Implement game logic using the database schema
