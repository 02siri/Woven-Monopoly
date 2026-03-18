import { useMemo, useReducer } from 'react';
import type { PropsWithChildren } from 'react';
import {
  GameDispatchContext,
  GameStateContext,
  initialGameState,
} from './GameContext';
import { gameReducer } from '../reducers/game.reducer';

const GameProvider = ({ children }: PropsWithChildren) => {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);

  const gameStateValue = useMemo(() => state, [state]);

  return (
    <GameStateContext.Provider value={gameStateValue}>
      <GameDispatchContext.Provider value={dispatch}>
        {children}
      </GameDispatchContext.Provider>
    </GameStateContext.Provider>
  );
};

export default GameProvider;
