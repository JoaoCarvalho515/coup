# Quick Start Guide

This guide will help you test the PartyKit multiplayer implementation for your Coup game.

## Prerequisites

- Node.js installed
- Two browser windows/tabs (for testing multiplayer)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Start the Servers

You need to run **two servers** simultaneously:

### Terminal 1: PartyKit Server
```bash
npm run dev:party
```

You should see:
```
✨ Built in Xms
🎈 PartyKit server running at http://localhost:1999
```

### Terminal 2: Next.js App
```bash
npm run dev
```

You should see:
```
✓ Ready in Xms
- Local: http://localhost:3000
```

## Step 3: Test Multiplayer

### Create a Game (Player 1)

1. Open `http://localhost:3000` in your browser
2. Click "Create Game"
3. You'll be redirected to `/game/[CODE]` with a 6-character code
4. Enter your name (e.g., "Alice")
5. Click "Join Game"
6. You should see yourself in the lobby

### Join the Game (Player 2)

1. Open a **new browser window** or **incognito tab**
2. Go to `http://localhost:3000`
3. Click "Join Game"
4. Enter the **same 6-character code** from Player 1
5. Click "Join Game"
6. Enter your name (e.g., "Bob")
7. Click "Join Game"

### Both Players Should Now See:
- The lobby with both player names
- "Players (2)" count
- "Start Game" button (enabled)

## Step 4: Start Playing

1. Either player can click **"Start Game"**
2. Both browsers should simultaneously show:
   - Game board with all players
   - Each player's coins (starting with 2)
   - Each player's influence cards (2 hidden cards each)
   - Current turn indicator
   - Game log

## Step 5: Test Real-time Sync

To verify real-time synchronization works:

1. **Current player** makes a move
2. **Other player's browser** should update instantly
3. Game log should show the action
4. Turn indicator should change
5. Both screens should match perfectly

## What You've Implemented

✅ **Room-based Multiplayer**: Each game has a unique room code
✅ **Real-time Synchronization**: All players see updates instantly via WebSockets
✅ **Persistent Lobby**: Players can join before the game starts
✅ **Automatic State Management**: PartyKit handles state sync and persistence
✅ **Connection Status**: Shows connection state and errors
✅ **Scalable Architecture**: Can run unlimited simultaneous games

## Current Features

- ✅ Player lobby with join/leave
- ✅ Game start with 2-6 players
- ✅ Real-time state synchronization
- ✅ Player cards and coins display
- ✅ Current turn indicator
- ✅ Game log display
- ⏳ Game actions (to be implemented in UI later)
- ⏳ Challenge/Block mechanics (to be implemented in UI later)

## Next Steps (For Later UI Development)

The backend is fully implemented! When you build the UI later, you'll use:

```tsx
const {
  gameState,        // Current game state
  performAction,    // Take an action (income, tax, coup, etc.)
  blockAction,      // Block another player's action
  passBlock,        // Pass on blocking
  challengeAction,  // Challenge an action/block
  passChallenge,    // Pass on challenging
  exchangeCards,    // Exchange cards (Ambassador)
  loseInfluence,    // Lose an influence card
} = usePartyCoup(roomCode);
```

## Troubleshooting

### "Connecting to game server..."
- Make sure PartyKit server is running (`npm run dev:party`)
- Check that it's on port 1999
- Verify `.env.local` has `NEXT_PUBLIC_PARTYKIT_HOST=localhost:1999`

### Players don't see each other
- Confirm both are using the **exact same room code**
- Check browser console for WebSocket errors
- Restart both servers if needed

### State not syncing
- Open browser DevTools → Network → WS tab
- Look for WebSocket connection to `localhost:1999`
- Check messages being sent/received
- Look at PartyKit server terminal for logs

## Testing Checklist

- [ ] Both servers start without errors
- [ ] Player 1 can create a game and join lobby
- [ ] Player 2 can join with the same code
- [ ] Both players see each other in lobby
- [ ] "Start Game" button works
- [ ] Game board displays correctly for both players
- [ ] Both players see the same game state
- [ ] Connection status shows "connected"

## Development Tips

1. **Browser DevTools**: Keep console open to see connection logs
2. **Server Logs**: Watch PartyKit terminal for message handling
3. **Multiple Tabs**: Test with 2-6 players in different tabs
4. **Incognito Mode**: Useful for testing multiple players locally

## Need Help?

Check these files:
- `PARTYKIT.md` - Detailed architecture documentation
- `party/index.ts` - Server implementation
- `lib/usePartyKit.ts` - Client hook
- `components/coup-game-client.tsx` - UI component

Happy testing! 🎈🎮
