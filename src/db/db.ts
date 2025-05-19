import { Player, Room, Game } from "../types/types";


export const players: Map<string, Player> = new Map();
export const rooms: Map<string, Room> = new Map();
export const games: Map<string, Game> = new Map();
export const winners: Map<string, number> = new Map();
