import {
  executeRoute,
  getGameIdFromRequest,
  optionsHandler,
} from '../../../../src/lib/api-route';
import { resumeGame } from '../../../../src/services/games';

export function OPTIONS() {
  return optionsHandler();
}

export function POST(request: Request) {
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
}
