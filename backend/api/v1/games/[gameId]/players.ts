import {
  executeRoute,
  getGameIdFromRequest,
  optionsHandler,
} from '../../../../src/lib/api-route';
import { getPlayersByGameId } from '../../../../src/services/games';

export function OPTIONS() {
  return optionsHandler();
}

export function GET(request: Request) {
  return executeRoute(() => getPlayersByGameId(getGameIdFromRequest(request)));
}
