import { ensureAppReady } from '../../src/lib/app-init';
import { jsonResponse, optionsResponse } from '../../src/lib/http';
import {
  abandonGame,
  confirmAction,
  createGame,
  deleteGame,
  exitGame,
  getGameById,
  getGames,
  getPlayersByGameId,
  getPropertiesByGameId,
  getTurnsByGameId,
  resolveTurn,
  restartGame,
  resumeGame,
  simulateGame,
} from '../../src/services/games';

const getRouteSegments = (request: Request) => {
  const pathname = new URL(request.url).pathname;
  const v1Index = pathname.indexOf('/api/v1');

  if (v1Index === -1) {
    return [];
  }

  return pathname
    .slice(v1Index + '/api/v1'.length)
    .split('/')
    .filter(Boolean);
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'An unexpected error occurred';

const getGameIdFromRoute = (gameId: string | undefined) => {
  if (!gameId) {
    throw new Error('A valid gameId must be provided');
  }

  return gameId;
};

const handleGet = async (segments: string[]) => {
  if (segments.length === 1 && segments[0] === 'games') {
    const data = await getGames();
    return jsonResponse({ data }, { status: 200 });
  }

  if (segments.length === 2 && segments[0] === 'games') {
    const gameId = getGameIdFromRoute(segments[1]);
    const data = await getGameById(gameId);

    if (!data) {
      return jsonResponse({ message: 'Game not found' }, { status: 404 });
    }

    return jsonResponse({ data }, { status: 200 });
  }

  if (segments.length === 3 && segments[0] === 'games') {
    const gameId = getGameIdFromRoute(segments[1]);

    if (segments[2] === 'players') {
      const data = await getPlayersByGameId(gameId);
      return jsonResponse({ data }, { status: 200 });
    }

    if (segments[2] === 'properties') {
      const data = await getPropertiesByGameId(gameId);
      return jsonResponse({ data }, { status: 200 });
    }

    if (segments[2] === 'turns') {
      const data = await getTurnsByGameId(gameId);
      return jsonResponse({ data }, { status: 200 });
    }
  }

  return jsonResponse({ message: 'Route not found' }, { status: 404 });
};

const handlePost = async (segments: string[]) => {
  if (segments.length === 1 && segments[0] === 'games') {
    const data = await createGame();
    return jsonResponse(
      {
        data,
        message: 'Game created successfully',
      },
      { status: 201 }
    );
  }

  if (segments.length === 3 && segments[0] === 'games') {
    const gameId = getGameIdFromRoute(segments[1]);

    if (segments[2] === 'exit') {
      const data = await exitGame(gameId);
      return jsonResponse(
        {
          data,
          message: 'Game exited successfully',
        },
        { status: 200 }
      );
    }

    if (segments[2] === 'abandon') {
      const data = await abandonGame(gameId);
      return jsonResponse(
        {
          data,
          message: 'Game abandoned successfully',
        },
        { status: 200 }
      );
    }

    if (segments[2] === 'resume') {
      const data = await resumeGame(gameId);
      return jsonResponse(
        {
          data,
          message: 'Game resumed successfully',
        },
        { status: 200 }
      );
    }

    if (segments[2] === 'restart') {
      const data = await restartGame(gameId);
      return jsonResponse(
        {
          data,
          message: 'Game restarted successfully',
        },
        { status: 200 }
      );
    }

    if (segments[2] === 'simulate') {
      const data = await simulateGame(gameId);
      return jsonResponse(
        {
          data,
          message: 'Game simulated successfully',
        },
        { status: 200 }
      );
    }
  }

  if (
    segments.length === 4 &&
    segments[0] === 'games' &&
    segments[2] === 'turns' &&
    segments[3] === 'resolve'
  ) {
    const gameId = getGameIdFromRoute(segments[1]);
    const data = await resolveTurn(gameId);
    return jsonResponse(
      {
        data,
        message: 'Turn resolved successfully',
      },
      { status: 200 }
    );
  }

  if (
    segments.length === 4 &&
    segments[0] === 'games' &&
    segments[2] === 'actions' &&
    segments[3] === 'confirm'
  ) {
    const gameId = getGameIdFromRoute(segments[1]);
    const data = await confirmAction(gameId);
    return jsonResponse(
      {
        data,
        message: 'Action confirmed successfully',
      },
      { status: 200 }
    );
  }

  return jsonResponse({ message: 'Route not found' }, { status: 404 });
};

const handleDelete = async (segments: string[]) => {
  if (
    segments.length === 3 &&
    segments[0] === 'games' &&
    segments[1] === 'delete'
  ) {
    const gameId = getGameIdFromRoute(segments[2]);
    const data = await deleteGame(gameId);

    return jsonResponse(
      {
        data,
        message: 'Game deleted successfully',
      },
      { status: 200 }
    );
  }

  return jsonResponse({ message: 'Route not found' }, { status: 404 });
};

const isGameNotFoundError = (message: string) => message === 'Game not found';

const isLifecycleRoute = (segments: string[]) =>
  segments.length === 3 &&
  segments[0] === 'games' &&
  ['exit', 'abandon', 'resume', 'restart'].includes(segments[2] ?? '');

const getErrorStatus = (method: string, segments: string[], message: string) => {
  if (isGameNotFoundError(message)) {
    return 404;
  }

  if (method === 'POST' && isLifecycleRoute(segments)) {
    return 400;
  }

  return 500;
};

export function OPTIONS() {
  return optionsResponse();
}

export async function GET(request: Request) {
  const segments = getRouteSegments(request);

  try {
    await ensureAppReady();
    return await handleGet(segments);
  } catch (error) {
    const message = getErrorMessage(error);
    return jsonResponse(
      { message },
      { status: getErrorStatus('GET', segments, message) }
    );
  }
}

export async function POST(request: Request) {
  const segments = getRouteSegments(request);

  try {
    await ensureAppReady();
    return await handlePost(segments);
  } catch (error) {
    const message = getErrorMessage(error);
    return jsonResponse(
      { message },
      { status: getErrorStatus('POST', segments, message) }
    );
  }
}

export async function DELETE(request: Request) {
  const segments = getRouteSegments(request);

  try {
    await ensureAppReady();
    return await handleDelete(segments);
  } catch (error) {
    const message = getErrorMessage(error);
    return jsonResponse(
      { message },
      { status: getErrorStatus('DELETE', segments, message) }
    );
  }
}
