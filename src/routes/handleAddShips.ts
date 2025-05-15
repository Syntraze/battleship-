import WebSocket from "ws";
import { games } from "../db/db";
import { Ship } from "../types/types";


export function handleAddShips(
  ws: WebSocket,
  data: {
    gameId: string;
    ships: Ship[];
    indexPlayer: string;
  }
) {
  const game = games.get(data.gameId);
  if (!game) return;

  const playerEntry = Object.entries(game.players).find(
    ([_, p]) => p.idPlayer === data.indexPlayer
  );
  if (!playerEntry) return;

  const [playerName, playerData] = playerEntry;
  playerData.ships = data.ships;
  playerData.ready = true;

  const allReady = Object.values(game.players).every((p) => p.ready);
  if (allReady) {
    // Notify both players that game is starting
    for (const [name, p] of Object.entries(game.players)) {
      p.socket.send(
        JSON.stringify({
          type: "start_game",
          data: {
            ships: p.ships,
            currentPlayerIndex: game.players[game.currentPlayer].idPlayer,
          },
          id: 0,
        })
      );
    }

    // Notify both whose turn it is
    broadcastTurn(game);
  }
}

function broadcastTurn(
  game: typeof games extends Map<any, infer T> ? T : never
) {
  for (const player of Object.values(game.players)) {
    player.socket.send(
      JSON.stringify({
        type: "turn",
        data: {
          currentPlayer: game.players[game.currentPlayer].idPlayer,
        },
        id: 0,
      })
    );
  }
}
