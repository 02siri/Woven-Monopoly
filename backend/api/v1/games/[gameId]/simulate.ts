import {
  executeRoute,
  getGameIdFromRequest,
  optionsHandler,
} from '../../../../src/lib/api-route';
import { simulateGame } from '../../../../src/services/games';

export function OPTIONS() {
  return optionsHandler();
}

export function POST(request: Request) {
  return executeRoute(() => simulateGame(getGameIdFromRequest(request)), {
    successMessage: 'Game simulated successfully',
  });
}
