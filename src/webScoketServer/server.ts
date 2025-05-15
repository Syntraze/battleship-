import WebSocket, { WebSocketServer } from "ws";

import { IncomingMessage } from "http";
import { handleMessage } from "../handlers/handlers";

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg.toString());
      handleMessage(ws, data);
    } catch (e) {
      console.error("Invalid message received:", msg);
    }
  });

  ws.on("close", () => {
    // Cleanup logic if needed
  });
});

console.log("WebSocket server started on ws://localhost:8080");
