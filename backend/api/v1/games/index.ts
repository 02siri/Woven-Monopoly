import { optionsHandler, executeRoute } from '../../../src/lib/api-route';
import { createGame, getGames } from '../../../src/services/games';

export function OPTIONS() {
  return optionsHandler();
}

export function GET() {
  return executeRoute(() => getGames());
}

export function POST() {
  return executeRoute(() => createGame(), {
    successMessage: 'Game created successfully',
    successStatus: 201,
  });
}
