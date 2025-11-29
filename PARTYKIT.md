# PartyKit Multiplayer Implementation

This document explains how PartyKit is integrated into the Coup game for real-time multiplayer functionality.

## Architecture Overview

```
┌─────────────────┐         WebSocket          ┌──────────────────┐
│  Next.js Client │ ◄───────────────────────► │  PartyKit Server │
│  (React Hook)   │                            │  (party/index.ts)│
└─────────────────┘                            └──────────────────┘
         │                                              │
         │                                              │
         ▼                                              ▼
┌─────────────────┐                            ┌──────────────────┐
│  Game UI        │                            │  Game State      │
│  Components     │                            │  Persistence     │
└─────────────────┘                            └──────────────────┘
```

## Components

### 1. PartyKit Server (`party/index.ts`)

The server handles:
- **Game State Management**: Stores and synchronizes the entire game state across all players
- **Player Connections**: Tracks who's in each game room
- **Message Routing**: Processes game actions and broadcasts updates
- **Persistence**: Saves game state to PartyKit's built-in storage

**Key Methods:**
- `onConnect()`: Sends current game state to newly connected players
- `onMessage()`: Handles all game actions (join, start, action, block, challenge, etc.)
- `onClose()`: Removes disconnected players from lobby
- `saveState()`: Persists game state to storage

### 2. React Hook (`lib/usePartyKit.ts`)

A custom hook that provides:
- **WebSocket Connection**: Manages connection to PartyKit server
- **Real-time Updates**: Receives and processes game state changes
- **Action Methods**: Provides functions to send game actions to server

**Usage:**
```tsx
const {
  gameState,      // Current game state
  players,        // Players in lobby
  isConnected,    // Connection status
  error,          // Error messages
  joinGame,       // Join with player name
  startGame,      // Start the game
  performAction,  // Perform game action
  // ... other action methods
} = usePartyCoup(roomCode);
```

### 3. Game Client Component (`components/coup-game-client.tsx`)

A React component that:
- Renders the game UI based on current state
- Handles player input and interactions
- Shows lobby, game board, and game log
- Displays connection status and errors

## Message Protocol

### Client → Server Messages

```typescript
// Join game
{ type: "join", payload: { playerName: string } }

// Start game
{ type: "start-game" }

// Perform action
{ type: "action", payload: ActionRequest }

// Block action
{ type: "block", payload: BlockRequest }

// Pass block opportunity
{ type: "pass-block" }

// Challenge action/block
{ type: "challenge", payload: ChallengeRequest }

// Pass challenge opportunity
{ type: "pass-challenge" }

// Exchange cards (Ambassador)
{ type: "exchange", payload: { keptCardIds: string[] } }

// Lose influence
{ type: "lose-influence", payload: { cardId: string } }
```

### Server → Client Messages

```typescript
// Game state update
{ type: "state", payload: GameState }

// Lobby player list
{ type: "waiting", payload: { players: PlayerConnection[] } }

// Player list updated
{ type: "players-updated", payload: { players: PlayerConnection[] } }

// Game started
{ type: "game-started", payload: { gameState: GameState } }

// Error message
{ type: "error", payload: { message: string } }
```

## Game Flow

### 1. Creating/Joining a Game

1. Player navigates to `/game/[code]` (e.g., `/game/ABC123`)
2. Client connects to PartyKit room with that code
3. Player enters name and clicks "Join Game"
4. Server adds player to lobby and broadcasts updated player list
5. Other players see the new player in their lobby

### 2. Starting the Game

1. Any player clicks "Start Game" (requires 2+ players)
2. Server initializes game state using `initializeGame()`
3. Server broadcasts `game-started` message with initial state
4. All clients receive state and render game board

### 3. Playing the Game

1. Current player performs an action via UI
2. Client sends action message to server
3. Server validates and updates game state
4. Server broadcasts new state to all clients
5. All clients update their UI simultaneously

### 4. Handling Disconnections

- If a player disconnects during lobby, they're removed
- If a player disconnects during game, their connection is preserved
- Game state persists in PartyKit storage
- Reconnecting players automatically receive current state

## Room Isolation

Each game room is completely isolated:
- Room ID = 6-character game code (e.g., "ABC123")
- Each room has its own PartyKit server instance
- Game state and players are unique per room
- Multiple games can run simultaneously

## Development Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.local.example .env.local
   ```

3. **Run servers:**
   ```bash
   # Terminal 1: PartyKit server
   npm run dev:party

   # Terminal 2: Next.js
   npm run dev
   ```

4. **Test multiplayer:**
   - Open `http://localhost:3000`
   - Create a game to get a code
   - Open a second browser/tab
   - Join with the same code
   - Both clients should see each other in lobby

## Deployment

### Deploy PartyKit Server

```bash
npx partykit deploy
```

This deploys to: `https://coup-party.YOUR-USERNAME.partykit.dev`

### Deploy Next.js App

1. Deploy to Vercel (or your preferred platform)
2. Set environment variable:
   ```
   NEXT_PUBLIC_PARTYKIT_HOST=coup-party.YOUR-USERNAME.partykit.dev
   ```

## Key Features

✅ **Real-time Synchronization**: All players see updates instantly
✅ **Persistent State**: Game survives server restarts
✅ **Automatic Reconnection**: PartySocket handles reconnection
✅ **Room Isolation**: Each game is completely independent
✅ **Low Latency**: WebSocket connection for fast updates
✅ **Simple API**: Easy to add new actions and features

## Adding New Actions

To add a new game action:

1. **Define action in game-logic.ts:**
   ```typescript
   export function newAction(state: GameState, ...): GameState {
     // Update state
     return state;
   }
   ```

2. **Add message type in party/index.ts:**
   ```typescript
   case "new-action": {
     if (!this.gameState) return;
     this.gameState = newAction(this.gameState, msg.payload);
     await this.saveState();
     this.party.broadcast(JSON.stringify({
       type: "state",
       payload: this.gameState,
     }));
     break;
   }
   ```

3. **Add method in usePartyKit.ts:**
   ```typescript
   const newAction = useCallback((params) => {
     sendMessage({ type: "new-action", payload: params });
   }, [sendMessage]);
   ```

4. **Use in UI component:**
   ```tsx
   const { newAction } = usePartyCoup(roomCode);
   // Call when needed
   newAction(params);
   ```

## Troubleshooting

**Connection Issues:**
- Verify PartyKit server is running (`npm run dev:party`)
- Check `NEXT_PUBLIC_PARTYKIT_HOST` environment variable
- Open browser console to see connection logs

**State Not Syncing:**
- Check server logs for errors
- Verify message format matches type definitions
- Ensure `saveState()` is called after state changes

**Players Not Seeing Each Other:**
- Confirm both clients use the same room code
- Check if `players-updated` messages are broadcasted
- Verify connection IDs are unique

## Resources

- [PartyKit Documentation](https://docs.partykit.io/)
- [PartySocket API](https://docs.partykit.io/reference/partysocket-api/)
- [Game Logic Documentation](./lib/game-logic.ts)
