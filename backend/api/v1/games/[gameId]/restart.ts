import {
  executeRoute,
  getGameIdFromRequest,
  optionsHandler,
} from '../../../../src/lib/api-route';
import { restartGame } from '../../../../src/services/games';

export function OPTIONS() {
  return optionsHandler();
}

export function POST(request: Request) {
  return executeRoute(() => restartGame(getGameIdFromRequest(request)), {
    badRequestMessages: ['Only completed, bankrupt, exited, or abandoned games can be restarted'],
    notFoundMessages: ['Game not found'],
    successMessage: 'Game restarted successfully',
  });
}
