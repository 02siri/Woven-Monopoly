import {
  executeRoute,
  getGameIdFromRequest,
  optionsHandler,
} from '../../../../src/lib/api-route';
import { abandonGame } from '../../../../src/services/games';

export function OPTIONS() {
  return optionsHandler();
}

export function POST(request: Request) {
  return executeRoute(() => abandonGame(getGameIdFromRequest(request)), {
    badRequestMessages: ['Game cannot be abandoned because it is already completed'],
    notFoundMessages: ['Game not found'],
    successMessage: 'Game abandoned successfully',
  });
}
