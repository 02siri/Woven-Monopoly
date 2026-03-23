import {
  executeRoute,
  getGameIdFromRequest,
  getPathSegments,
  optionsHandler,
} from '../../../../../src/lib/api-route';
import { jsonResponse } from '../../../../../src/lib/http';
import { resolveTurn } from '../../../../../src/services/games';

export function OPTIONS() {
  return optionsHandler();
}

export function POST(request: Request) {
  const segments = getPathSegments(request);
  const action = segments[5];

  switch (action) {
    case 'resolve':
      return executeRoute(() => resolveTurn(getGameIdFromRequest(request)), {
        successMessage: 'Turn resolved successfully',
      });
    default:
      return jsonResponse({ message: 'Route not found' }, { status: 404 });
  }
}
