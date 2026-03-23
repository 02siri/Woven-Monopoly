import {
  executeRoute,
  getGameIdFromRequest,
  optionsHandler,
} from '../../../../../src/lib/api-route';
import { resolveTurn } from '../../../../../src/services/games';

export function OPTIONS() {
  return optionsHandler();
}

export function POST(request: Request) {
  return executeRoute(() => resolveTurn(getGameIdFromRequest(request)), {
    successMessage: 'Turn resolved successfully',
  });
}
