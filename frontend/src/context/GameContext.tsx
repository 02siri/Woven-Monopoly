import { createContext, useContext } from 'react';
import type { Dispatch } from 'react';
import type { Game } from '../types/game.types';
import type { Player } from '../types/player.types';
import type { Property } from '../types/property.types';
import type { Turn } from '../types/turn.types';

export type GameState = {
  game: Game | null;
  games: Game[];
  players: Player[];
  properties: Property[];
  turns: Turn[];
  loading: boolean;
  error: string | null;
};

export type GameAction =
  | { action: 'SET_LOADING'; payload: boolean }
  | { action: 'SET_ERROR'; payload: string | null }
  | {
      action: 'SET_GAME_SETUP';
      payload: {
        game: Game;
        players: Player[];
        properties: Property[];
      };
    }
  | {
      action: 'SET_SIMULATION_RESULT';
      payload: {
        game: Game;
        players: Player[];
        properties: Property[];
        turns: Turn[];
      };
    }
  | {
      action: 'SET_TURN_RESULT';
      payload: {
        game: Game;
        players: Player[];
        properties: Property[];
        turn: Turn;
      };
    }
  | {
      action: 'SET_GAME_DETAILS';
      payload: {
        game: Game;
        players: Player[];
        properties: Property[];
        turns: Turn[];
      };
    }
  | {
      action: 'SET_GAME_HISTORY';
      payload: Game[];
    }
  | {
      action: 'RESET_CURRENT_GAME';
    };

export const initialGameState: GameState = {
  game: null,
  games: [],
  players: [],
  properties: [],
  turns: [],
  loading: false,
  error: null,
};

const GameStateContext = createContext<GameState | undefined>(undefined);
const GameDispatchContext = createContext<Dispatch<GameAction> | undefined>(
  undefined
);

export const useGameState = () => {
  const context = useContext(GameStateContext);

  if (!context) {
    throw new Error('useGameState must be used inside GameProvider');
  }

  return context;
};

export const useGameDispatch = () => {
  const context = useContext(GameDispatchContext);

  if (!context) {
    throw new Error('useGameDispatch must be used inside GameProvider');
  }

  return context;
};

export { GameDispatchContext, GameStateContext };
