import WebSocket from "ws";

import { handleReg } from "../routes/handleReg";
import { WSMessage } from "../types/types";
import { handleCreateRoom } from "../routes/handleCreateRoom";


export function handleMessage(ws: WebSocket, msg: WSMessage) {
  switch (msg.type) {
    case "reg":
      return handleReg(ws, msg.data);
    case "create_room":
      return handleCreateRoom(ws);
    case "add_user_to_room":
      
    default:
      console.warn("Unknown message type:", msg.type);
  }
}
