import WebSocket, { WebSocketServer } from "ws";

import { IncomingMessage } from "http";
import { handleMessage } from "../handlers/handlers";

const wss = new WebSocketServer({ port: 3000 });
wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
  ws.on("message", (msg) => {
    console.log("Raw message received:", msg.toString());

    try {
      // First parse the incoming raw message
      const parsedData = JSON.parse(msg.toString());
      console.log("Parsed data:", parsedData);

      // Ensure `data` is properly parsed
      if (
        typeof parsedData.data === "string" &&
        parsedData.data.trim() !== ""
      ) {
        try {
          parsedData.data = JSON.parse(parsedData.data);
        } catch (err) {
          console.error("Failed to parse nested data:", parsedData.data);
          return; // Skip further processing if nested data is invalid.
        }
      } else if (typeof parsedData.data === "string") {
        // Optionally, convert an empty string to an empty object or null if that fits your logic.
        parsedData.data = {};
      }
      
      // Ensure `parsedData` is an object before passing
      if (typeof parsedData !== "object" || parsedData === null) {
        console.error("Parsed data is not a valid object:", parsedData);
        return;
      }

      handleMessage(ws, parsedData);
    } catch (e) {
      console.error(
        "Invalid message received, cannot parse JSON:",
        msg.toString()
      );
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected.");
    // Cleanup logic if needed
  });
});


console.log("WebSocket server started on ws://localhost:3000");
