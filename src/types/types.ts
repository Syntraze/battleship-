import type { WebSocket } from "ws";
export interface WSMessage {
  type: string;
  data: any;
  id: number;
}

export interface Player {
  name: string;
  password: string;
  wins: number;
  socket: WebSocket;
}

export interface Room {
  roomId: string;
  players: string[];
}

export interface Ship {
  position: { x: number; y: number };
  direction: boolean;
  length: number;
  type: "small" | "medium" | "large" | "huge";
}

export interface Game {
  idGame: string;
  players: {
    [index: string]: {
      ready: boolean;
      idPlayer: string;
      name: string; // ✅ Add this line
      ships: Ship[];
      socket: WebSocket;
      board: string[][];
    };
  };
  currentPlayer: string;
}
