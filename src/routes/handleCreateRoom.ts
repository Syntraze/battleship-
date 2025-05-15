import WebSocket from "ws";

import { v4 as uuidv4 } from "uuid";
import { players, rooms } from "../db/db";

export function handleCreateRoom(ws: WebSocket) {
  const player = Array.from(players.values()).find((p) => p.socket === ws);
  if (!player) return;

  const roomId = uuidv4();
  rooms.set(roomId, {
    roomId,
    players: [player.name],
  });

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
        data: roomList,
        id: 0,
      })
    );
  }
}
