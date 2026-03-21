import type {
  ConfirmActionResponse,
  CreateGameResponse,
  ResolveTurnResponse,
  SimulateGameResponse,
} from '../types/api.types';
import type { Game } from '../types/game.types';
import type { Player } from '../types/player.types';
import type { Property } from '../types/property.types';
import type { Turn } from '../types/turn.types';
import { request } from './client';

export const createGame = () => {
  return request<CreateGameResponse>('/games', {
    method: 'POST',
  });
};

export const deleteGame = (gameId: string) => {
  return request<{ gameId: string; deleted: boolean }>(`/games/delete/${gameId}`, {
    method: 'DELETE',
  });
};

export const simulateGame = (gameId: string) => {
  return request<SimulateGameResponse>(`/games/${gameId}/simulate`, {
    method: 'POST',
  });
};

export const resolveTurn = (gameId: string) => {
  return request<ResolveTurnResponse>(`/games/${gameId}/turns/resolve`, {
    method: 'POST',
  });
};

export const confirmAction = (gameId: string) => {
  return request<ConfirmActionResponse>(`/games/${gameId}/actions/confirm`, {
    method: 'POST',
  });
};

export const fetchGames = () => {
  return request<Game[]>('/games');
};

export const fetchGameById = (gameId: string) => {
  return request<Game>(`/games/${gameId}`);
};

export const fetchPlayersByGameId = (gameId: string) => {
  return request<Player[]>(`/games/${gameId}/players`);
};

export const fetchPropertiesByGameId = (gameId: string) => {
  return request<Property[]>(`/games/${gameId}/properties`);
};

export const fetchTurnsByGameId = (gameId: string) => {
  return request<Turn[]>(`/games/${gameId}/turns`);
};
