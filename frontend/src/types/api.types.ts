import type { Game, PendingAction } from './game.types';
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

export type ResolveTurnResponse = {
  game: Game;
  players: Player[];
  properties: Property[];
  turn: Turn | null;
  currentPlayer: Player;
  nextPlayer: Player | null;
  winner: Player | null;
  pendingAction: PendingAction | null;
};

export type ConfirmActionResponse = ResolveTurnResponse;
