import {
  executeRoute,
  getGameIdFromRequest,
  getPathSegments,
  optionsHandler,
} from '../../../../src/lib/api-route';
import { jsonResponse } from '../../../../src/lib/http';
import {
  abandonGame,
  exitGame,
  restartGame,
  resumeGame,
  simulateGame,
} from '../../../../src/services/games';

export function OPTIONS() {
  return optionsHandler();
}

export function POST(request: Request) {
  const segments = getPathSegments(request);
  const action = segments[4];

  switch (action) {
    case 'exit':
      return executeRoute(() => exitGame(getGameIdFromRequest(request)), {
        badRequestMessages: ['Game cannot be exited because it is already completed'],
        notFoundMessages: ['Game not found'],
        successMessage: 'Game exited successfully',
      });
    case 'abandon':
      return executeRoute(() => abandonGame(getGameIdFromRequest(request)), {
        badRequestMessages: ['Game cannot be abandoned because it is already completed'],
        notFoundMessages: ['Game not found'],
        successMessage: 'Game abandoned successfully',
      });
    case 'resume':
      return executeRoute(() => resumeGame(getGameIdFromRequest(request)), {
        badRequestMessages: [
          'Only exited games can be resumed',
          'The game cannot be resumed because all players have gone bankrupt',
          'The game cannot be resumed because it has already been completed',
          'The game cannot be resumed because it was abandoned',
        ],
        notFoundMessages: ['Game not found'],
        successMessage: 'Game resumed successfully',
      });
    case 'restart':
      return executeRoute(() => restartGame(getGameIdFromRequest(request)), {
        badRequestMessages: ['Only completed, bankrupt, exited, or abandoned games can be restarted'],
        notFoundMessages: ['Game not found'],
        successMessage: 'Game restarted successfully',
      });
    case 'simulate':
      return executeRoute(() => simulateGame(getGameIdFromRequest(request)), {
        successMessage: 'Game simulated successfully',
      });
    default:
      return jsonResponse({ message: 'Route not found' }, { status: 404 });
  }
}
