import WebSocket from "ws";

import { v4 as uuidv4 } from "uuid";
import { players, rooms, games } from "../db/db";

export function handleAddUserToRoom(
  ws: WebSocket,
  data: { indexRoom: string }
) {
  const player2 = Array.from(players.values()).find((p) => p.socket === ws);
  if (!player2) return;

  const room = rooms.get(data.indexRoom);
  if (!room || room.players.length !== 1) return;

  const player1Name = room.players[0];
  const player1 = players.get(player1Name);
  if (!player1) return;

  room.players.push(player2.name);
  rooms.delete(data.indexRoom); // remove room from open list

  const idGame = uuidv4();
  const idPlayer1 = uuidv4();
  const idPlayer2 = uuidv4();

  games.set(idGame, {
    idGame,
    players: {
      [player1.name]: {
        idPlayer: idPlayer1,
        name: player1.name,
        ready: false, // ✅ Added
        ships: [],
        socket: player1.socket,
        board: Array(10)
          .fill(null)
          .map(() => Array(10).fill(null)),
      },
      [player2.name]: {
        idPlayer: idPlayer2,
        name: player2.name,
        ready: false, // ✅ Added
        ships: [],
        socket: player2.socket,
        board: Array(10)
          .fill(null)
          .map(() => Array(10).fill(null)),
      },
    },
    currentPlayer: player1.name,
  });
  
  

  // Notify both players
  const createGamePayload = (idPlayer: string) => ({
    type: "create_game",
    data: JSON.stringify({
      idGame,
      idPlayer,
    }),
    id: 0,
  });

  player1.socket.send(JSON.stringify(createGamePayload(idPlayer1)));
  player2.socket.send(JSON.stringify(createGamePayload(idPlayer2)));

  broadcastRoomUpdate();
}

function broadcastRoomUpdate() {
  const roomList = Array.from(rooms.values())
    .filter((room) => room.players.length === 1)
    .map((room) => ({
      roomId: room.roomId,
      roomUsers: room.players.map((name) => {
        const p = players.get(name)!;
        return { name: p.name, index: p.name };
      }),
    }));

  for (const player of players.values()) {
    player.socket.send(
      JSON.stringify({
        type: "update_room",
        data: JSON.stringify(roomList),
        id: 0,
      })
    );
  }
}
