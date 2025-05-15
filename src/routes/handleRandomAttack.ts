import WebSocket from "ws";

import { handleAttack } from "./handleAttack";
import { games } from "../db/db";

export function handleRandomAttack(
  ws: WebSocket,
  data: {
    gameId: string;
    indexPlayer: string;
  }
) {
  const game = games.get(data.gameId);
  if (!game) return;

  const attacker = Object.values(game.players).find(
    (p) => p.idPlayer === data.indexPlayer
  );
  if (!attacker) return;

  const defender = Object.values(game.players).find(
    (p) => p.idPlayer !== data.indexPlayer
  );
  if (!defender) return;

  // Find all cells that have not been attacked
  const candidates: { x: number; y: number }[] = [];
  for (let y = 0; y < defender.board.length; y++) {
    for (let x = 0; x < defender.board[y].length; x++) {
      const cell = defender.board[y][x];
      if (cell === null) {
        candidates.push({ x, y });
      }
    }
  }

  if (candidates.length === 0) return;

  const randomIndex = Math.floor(Math.random() * candidates.length);
  const target = candidates[randomIndex];

  // Reuse attack logic
  handleAttack(ws, {
    gameId: data.gameId,
    x: target.x,
    y: target.y,
    indexPlayer: data.indexPlayer,
  });
}
