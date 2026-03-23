import {
  executeRoute,
  getGameIdFromRequest,
  optionsHandler,
} from '../../../../../src/lib/api-route';
import { confirmAction } from '../../../../../src/services/games';

export function OPTIONS() {
  return optionsHandler();
}

export function POST(request: Request) {
  return executeRoute(() => confirmAction(getGameIdFromRequest(request)), {
    successMessage: 'Action confirmed successfully',
  });
}
