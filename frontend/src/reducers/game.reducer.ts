import type { GameAction, GameState } from '../context/GameContext';

export const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.action) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };

    case 'SET_GAME_SETUP':
      return {
        ...state,
        game: action.payload.game,
        players: action.payload.players,
        properties: action.payload.properties,
        turns: [],
        error: null,
      };

    case 'SET_SIMULATION_RESULT':
      return {
        ...state,
        game: action.payload.game,
        players: action.payload.players,
        properties: action.payload.properties,
        turns: action.payload.turns,
        error: null,
      };

    case 'SET_GAME_HISTORY':
      return {
        ...state,
        games: action.payload,
      };

    default:
      return state;
  }
};
