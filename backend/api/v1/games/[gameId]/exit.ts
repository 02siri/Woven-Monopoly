import {
  executeRoute,
  getGameIdFromRequest,
  optionsHandler,
} from '../../../../src/lib/api-route';
import { exitGame } from '../../../../src/services/games';

export function OPTIONS() {
  return optionsHandler();
}

export function POST(request: Request) {
  return executeRoute(() => exitGame(getGameIdFromRequest(request)), {
    badRequestMessages: ['Game cannot be exited because it is already completed'],
    notFoundMessages: ['Game not found'],
    successMessage: 'Game exited successfully',
  });
}
