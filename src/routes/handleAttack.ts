import WebSocket from "ws";
import { games, winners } from "../db/db";


export function handleAttack(
  ws: WebSocket,
  data: {
    gameId: string;
    x: number;
    y: number;
    indexPlayer: string;
  }
) {
  const game = games.get(data.gameId);
  if (!game) return;

  const attacker = Object.values(game.players).find(
    (p) => p.idPlayer === data.indexPlayer
  );
  const attackerName = Object.keys(game.players).find(
    (name) => game.players[name].idPlayer === data.indexPlayer
  );
  if (!attacker || !attackerName) return;

  const defenderName = Object.keys(game.players).find(
    (name) => name !== attackerName
  );
  const defender = game.players[defenderName!];

  const cell = defender.board[data.y][data.x];

  if (cell === "hit" || cell === "miss") return; // already attacked

  // Check for ship at coordinates
  let hit = false;
  for (const ship of defender.ships) {
    const cells = getShipCells(ship);
    for (const { x, y } of cells) {
      if (x === data.x && y === data.y) {
        hit = true;
        break;
      }
    }
    if (hit) break;
  }

  defender.board[data.y][data.x] = hit ? "hit" : "miss";

  const status = hit ? "shot" : "miss";

  // Check if ship is killed
  let killed = false;
  if (hit) {
    for (const ship of defender.ships) {
      const cells = getShipCells(ship);
      const allHit = cells.every(({ x, y }) => defender.board[y][x] === "hit");
      if (allHit) {
        killed = true;
        for (const { x, y } of getSurroundingCells(cells)) {
          if (defender.board[y]?.[x] === null) defender.board[y][x] = "miss";
        }
      }
    }
  }

  // Send attack result to both players
  const result = {
    type: "attack",
    data: {
      position: { x: data.x, y: data.y },
      currentPlayer: attacker.idPlayer,
      status: killed ? "killed" : status,
    },
    id: 0,
  };

  attacker.socket.send(JSON.stringify(result));
  defender.socket.send(JSON.stringify(result));

  // Check for win
  const defenderShipCells = defender.ships.flatMap(getShipCells);
  const allSunk = defenderShipCells.every(
    ({ x, y }) => defender.board[y][x] === "hit"
  );

  if (allSunk) {
    attacker.socket.send(
      JSON.stringify({
        type: "finish",
        data: { winPlayer: attacker.idPlayer },
        id: 0,
      })
    );

    defender.socket.send(
      JSON.stringify({
        type: "finish",
        data: { winPlayer: attacker.idPlayer },
        id: 0,
      })
    );

    // Update winner table
    winners.set(attacker.name, (winners.get(attacker.name) || 0) + 1);

    // Broadcast updated winner list
    const winnerList = Array.from(winners.entries()).map(([name, wins]) => ({
      name,
      wins,
    }));
    for (const p of Object.values(game.players)) {
      p.socket.send(
        JSON.stringify({
          type: "update_winners",
          data: winnerList,
          id: 0,
        })
      );
    }

    games.delete(data.gameId);
    return;
  }

  // Turn logic
  if (!hit || killed) {
    game.currentPlayer = defenderName!;
  }

  for (const p of Object.values(game.players)) {
    p.socket.send(
      JSON.stringify({
        type: "turn",
        data: { currentPlayer: game.players[game.currentPlayer].idPlayer },
        id: 0,
      })
    );
  }
}

function getShipCells(ship: {
  position: { x: number; y: number };
  direction: boolean;
  length: number;
}) {
  const { x, y } = ship.position;
  return Array.from({ length: ship.length }).map((_, i) => ({
    x: x + (ship.direction ? i : 0),
    y: y + (ship.direction ? 0 : i),
  }));
}

function getSurroundingCells(cells: { x: number; y: number }[]) {
  const surrounding = new Set<string>();
  for (const { x, y } of cells) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        surrounding.add(`${x + dx},${y + dy}`);
      }
    }
  }
  return Array.from(surrounding).map((s) => {
    const [x, y] = s.split(",").map(Number);
    return { x, y };
  });
}
