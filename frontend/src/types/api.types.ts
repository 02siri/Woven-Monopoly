import type { Game } from './game.types';
import type { Player } from './player.types';
import type { Property } from './property.types';
import type { Turn } from './turn.types';

export type CreateGameResponse = {
  game: Game;
  players: Player[];
  properties: Property[];
};

export type SimulateGameResponse = {
  game: Game;
  players: Player[];
  properties: Property[];
  turns: Turn[];
  winner: Player;
};
