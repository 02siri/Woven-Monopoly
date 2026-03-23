import { ensureAppReady } from './app-init';
import { jsonResponse, optionsResponse } from './http';

type ExecuteRouteOptions = {
  badRequestMessages?: string[];
  notFoundMessages?: string[];
  successMessage?: string;
  successStatus?: number;
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'An unexpected error occurred';

const getErrorStatus = (
  message: string,
  options?: Pick<ExecuteRouteOptions, 'badRequestMessages' | 'notFoundMessages'>
) => {
  if (options?.notFoundMessages?.includes(message)) {
    return 404;
  }

  if (options?.badRequestMessages?.includes(message)) {
    return 400;
  }

  return 500;
};

export const executeRoute = async <TData>(
  work: () => Promise<TData>,
  options?: ExecuteRouteOptions
) => {
  try {
    await ensureAppReady();
    const data = await work();

    return jsonResponse(
      options?.successMessage ? { data, message: options.successMessage } : { data },
      { status: options?.successStatus ?? 200 }
    );
  } catch (error) {
    const message = getErrorMessage(error);

    return jsonResponse(
      { message },
      {
        status: getErrorStatus(message, options),
      }
    );
  }
};

export const optionsHandler = () => optionsResponse();

export const getPathSegments = (request: Request) =>
  new URL(request.url).pathname.split('/').filter(Boolean);

export const getGameIdFromRequest = (request: Request) => {
  const segments = getPathSegments(request);
  const gameId = segments[3];

  if (!gameId) {
    throw new Error('A valid gameId must be provided');
  }

  return gameId;
};
