import type * as Party from "partykit/server";
import { GameState, initializeGame, performAction, blockAction, passBlock, challengeAction, passChallenge, exchangeCards, loseInfluence, endTurn, ActionRequest, BlockRequest, ChallengeRequest } from "../lib/game-logic";

type MessageType =
  | { type: "join"; payload: { playerName: string } }
  | { type: "start-game" }
  | { type: "kick-player"; payload: { playerId: string } }
  | { type: "action"; payload: ActionRequest }
  | { type: "block"; payload: BlockRequest }
  | { type: "pass-block" }
  | { type: "challenge"; payload: ChallengeRequest }
  | { type: "pass-challenge" }
  | { type: "exchange"; payload: { keptCardIds: string[] } }
  | { type: "lose-influence"; payload: { cardId: string } }
  | { type: "get-state" }
  | { type: "ping" };

interface PlayerConnection {
  id: string;
  name: string;
}

export default class CoupServer implements Party.Server {
  options: Party.ServerOptions = { hibernate: false };
  gameState: GameState | null = null;
  players: Map<string, PlayerConnection> = new Map();
  hostId: string | null = null;

  constructor(readonly party: Party.Party) { }

  async onStart() {
    // Load game state from storage if it exists
    const savedState = await this.party.storage.get<GameState>("gameState");
    if (savedState) {
      this.gameState = savedState;
    }

    const savedPlayers = await this.party.storage.get<[string, PlayerConnection][]>("players");
    if (savedPlayers) {
      this.players = new Map(savedPlayers);
    }

    const savedHostId = await this.party.storage.get<string>("hostId");
    if (savedHostId) {
      this.hostId = savedHostId;
    }

    // Mark this room as active
    await this.party.storage.put("createdAt", Date.now());
    await this.party.storage.put("isActive", true);
  }

  async saveState() {
    if (this.gameState) {
      await this.party.storage.put("gameState", this.gameState);
    }
    await this.party.storage.put("players", Array.from(this.players.entries()));
    if (this.hostId) {
      await this.party.storage.put("hostId", this.hostId);
    }
  }

  onConnect(conn: Party.Connection) {
    console.log(`Player connected: ${conn.id} to room ${this.party.id}`);

    // Send current game state to the newly connected player
    if (this.gameState) {
      conn.send(JSON.stringify({ type: "state", payload: this.gameState }));
    } else {
      conn.send(JSON.stringify({
        type: "waiting",
        payload: {
          players: Array.from(this.players.values()),
          hostId: this.hostId
        }
      }));
    }
  }

  async onMessage(message: string, sender: Party.Connection) {
    try {
      const msg = JSON.parse(message) as MessageType;

      switch (msg.type) {
        case "join": {
          // Set first player as host
          if (this.players.size === 0 && !this.hostId) {
            this.hostId = sender.id;
          }

          // Add player to the lobby
          this.players.set(sender.id, {
            id: sender.id,
            name: msg.payload.playerName,
          });
          await this.saveState();

          // Broadcast updated player list
          this.party.broadcast(JSON.stringify({
            type: "players-updated",
            payload: {
              players: Array.from(this.players.values()),
              hostId: this.hostId
            },
          }));
          break;
        }

        case "start-game": {
          // Only host can start the game
          if (sender.id !== this.hostId) {
            sender.send(JSON.stringify({
              type: "error",
              payload: { message: "Only the host can start the game" },
            }));
            return;
          }

          // Initialize the game with all players
          if (this.players.size < 2) {
            sender.send(JSON.stringify({
              type: "error",
              payload: { message: "Need at least 2 players to start" },
            }));
            return;
          }

          const playerNames = Array.from(this.players.values()).map(p => p.name);
          this.gameState = initializeGame(playerNames);

          // Map connection IDs to player IDs in game state
          const playerIdMap = new Map<string, string>();
          Array.from(this.players.keys()).forEach((connId, index) => {
            playerIdMap.set(connId, this.gameState!.players[index].id);
          });

          await this.saveState();

          // Broadcast game started
          this.party.broadcast(JSON.stringify({
            type: "game-started",
            payload: { gameState: this.gameState },
          }));
          break;
        }

        case "kick-player": {
          // Only host can kick players
          if (sender.id !== this.hostId) {
            sender.send(JSON.stringify({
              type: "error",
              payload: { message: "Only the host can kick players" },
            }));
            return;
          }

          // Can't kick if game has started
          if (this.gameState && this.gameState.phase !== "waiting") {
            sender.send(JSON.stringify({
              type: "error",
              payload: { message: "Cannot kick players after game has started" },
            }));
            return;
          }

          // Remove player
          this.players.delete(msg.payload.playerId);
          await this.saveState();

          // Broadcast updated player list
          this.party.broadcast(JSON.stringify({
            type: "players-updated",
            payload: {
              players: Array.from(this.players.values()),
              hostId: this.hostId
            },
          }));

          // Send kick message to kicked player
          for (const conn of this.party.getConnections()) {
            if (conn.id === msg.payload.playerId) {
              conn.send(JSON.stringify({
                type: "kicked",
                payload: { message: "You have been kicked from the game" },
              }));
              conn.close();
              break;
            }
          }
          break;
        }

        case "action": {
          if (!this.gameState) return;

          this.gameState = performAction(this.gameState, msg.payload);
          await this.saveState();

          this.party.broadcast(JSON.stringify({
            type: "state",
            payload: this.gameState,
          }));
          break;
        }

        case "block": {
          if (!this.gameState) return;

          this.gameState = blockAction(this.gameState, msg.payload);
          await this.saveState();

          this.party.broadcast(JSON.stringify({
            type: "state",
            payload: this.gameState,
          }));
          break;
        }

        case "pass-block": {
          if (!this.gameState) return;

          this.gameState = passBlock(this.gameState);
          await this.saveState();

          this.party.broadcast(JSON.stringify({
            type: "state",
            payload: this.gameState,
          }));
          break;
        }

        case "challenge": {
          if (!this.gameState) return;

          this.gameState = challengeAction(this.gameState, msg.payload);
          await this.saveState();

          this.party.broadcast(JSON.stringify({
            type: "state",
            payload: this.gameState,
          }));
          break;
        }

        case "pass-challenge": {
          if (!this.gameState) return;

          this.gameState = passChallenge(this.gameState);
          await this.saveState();

          this.party.broadcast(JSON.stringify({
            type: "state",
            payload: this.gameState,
          }));
          break;
        }

        case "exchange": {
          if (!this.gameState) return;

          const playerId = this.getPlayerIdFromConnection(sender.id);
          if (!playerId) return;

          this.gameState = exchangeCards(this.gameState, playerId, msg.payload.keptCardIds);
          await this.saveState();

          this.party.broadcast(JSON.stringify({
            type: "state",
            payload: this.gameState,
          }));
          break;
        }

        case "lose-influence": {
          if (!this.gameState) return;

          const playerId = this.getPlayerIdFromConnection(sender.id);
          if (!playerId) return;

          loseInfluence(this.gameState, playerId, msg.payload.cardId);
          await this.saveState();

          this.party.broadcast(JSON.stringify({
            type: "state",
            payload: this.gameState,
          }));
          break;
        }

        case "get-state": {
          if (this.gameState) {
            sender.send(JSON.stringify({
              type: "state",
              payload: this.gameState,
            }));
          }
          break;
        }

        case "ping": {
          // Simple ping to check if room is active
          sender.send(JSON.stringify({ type: "pong" }));
          break;
        }
      }
    } catch (error) {
      console.error("Error handling message:", error);
      sender.send(JSON.stringify({
        type: "error",
        payload: { message: "Invalid message format" },
      }));
    }
  }

  onClose(conn: Party.Connection) {
    console.log(`Player disconnected: ${conn.id}`);

    // Remove player from the lobby if game hasn't started
    if (!this.gameState || this.gameState.phase === "waiting") {
      this.players.delete(conn.id);

      // If host left, assign new host (first remaining player)
      if (conn.id === this.hostId) {
        const remainingPlayers = Array.from(this.players.keys());
        this.hostId = remainingPlayers.length > 0 ? remainingPlayers[0] : null;
      }

      this.saveState();

      this.party.broadcast(JSON.stringify({
        type: "players-updated",
        payload: {
          players: Array.from(this.players.values()),
          hostId: this.hostId
        },
      }));
    }
  }

  onError(conn: Party.Connection, error: Error) {
    console.error(`Error for connection ${conn.id}:`, error);
  }

  // Helper method to get player ID from connection ID
  private getPlayerIdFromConnection(connId: string): string | null {
    if (!this.gameState) return null;

    const playerIndex = Array.from(this.players.keys()).indexOf(connId);
    if (playerIndex === -1) return null;

    return this.gameState.players[playerIndex]?.id || null;
  }
}

CoupServer satisfies Party.Worker;
