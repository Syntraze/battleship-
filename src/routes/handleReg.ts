import type { WebSocket } from "ws";

import { players, winners } from "../db/db";

export function handleReg(
  ws: WebSocket,
  data: { name: string; password: string }
) {
  const { name, password } = data;
  let error = false;
  let errorText = "";

  if (!name || !password) {
    error = true;
    errorText = "Invalid name or password.";
  } else if (players.has(name)) {
    const existing = players.get(name)!;
    if (existing.password !== password) {
      error = true;
      errorText = "Wrong password.";
    } else {
      existing.socket = ws;
    }
  } else {
    players.set(name, { name, password, wins: 0, socket: ws });
    winners.set(name, 0);
  }

  ws.send(
    JSON.stringify({
      type: "reg",
      data:  JSON.stringify({
        name,
        index: name,
        error,
        errorText,
      }),
      id: 0,
    })
  );
}
