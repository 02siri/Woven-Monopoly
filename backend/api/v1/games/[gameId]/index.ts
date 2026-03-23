import {
  executeRoute,
  getGameIdFromRequest,
  optionsHandler,
} from '../../../../src/lib/api-route';
import { getGameById } from '../../../../src/services/games';

export function OPTIONS() {
  return optionsHandler();
}

export function GET(request: Request) {
  return executeRoute(async () => {
    const gameId = getGameIdFromRequest(request);
    const game = await getGameById(gameId);

    if (!game) {
      throw new Error('Game not found');
    }

    return game;
  }, {
    notFoundMessages: ['Game not found'],
  });
}
