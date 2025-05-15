import WebSocket from "ws";


import { WSMessage } from "../types/types";
import { handleReg } from "../routes/handleReg";


export function handleMessage(ws: WebSocket, msg: WSMessage) {
  switch (msg.type) {
    case "reg":
      return handleReg(ws, msg.data);
    default:
      console.warn("Unknown message type:", msg.type);
  }
}
