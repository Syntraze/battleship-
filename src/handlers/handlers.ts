import WebSocket from "ws";

import { handleReg } from "../routes/handleReg";
import { WSMessage } from "../types/types";
import { handleAddShips } from "../routes/handleAddShips";
import { handleAddUserToRoom } from "../routes/handleAddUserToRoom";
import { handleAttack } from "../routes/handleAttack";
import { handleCreateRoom } from "../routes/handleCreateRoom";


export function handleMessage(ws: WebSocket, msg: WSMessage) {
  switch (msg.type) {
    case "reg":
      return handleReg(ws, msg.data);
    case "create_room":
      return handleCreateRoom(ws);
    case "add_user_to_room":
      return handleAddUserToRoom(ws, msg.data);
    case "add_ships":
      return handleAddShips(ws, msg.data);
    case "attack":
      return handleAttack(ws, msg.data);

    default:
      console.warn("Unknown message type:", msg.type);
  }
}
