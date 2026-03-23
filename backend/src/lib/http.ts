type HeaderValue = string | null | undefined;
type HeaderMap = Record<string, HeaderValue>;

type RouteParams = Record<string, string | string[] | undefined>;
export type RouteContext<TParams extends RouteParams = RouteParams> = {
  params: Promise<TParams>;
};

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? '*';

const buildHeaders = (headers?: HeaderMap) => {
  const resolvedHeaders = new Headers();
  resolvedHeaders.set('Access-Control-Allow-Origin', FRONTEND_ORIGIN);
  resolvedHeaders.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );
  resolvedHeaders.set(
    'Access-Control-Allow-Methods',
    'GET, POST, DELETE, OPTIONS'
  );

  if (headers) {
    Object.entries(headers).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        resolvedHeaders.set(key, value);
      }
    });
  }

  return resolvedHeaders;
};

export const jsonResponse = (
  body: unknown,
  init?: {
    headers?: HeaderMap;
    status?: number;
  }
) =>
  Response.json(body, {
    headers: buildHeaders(init?.headers),
    status: init?.status,
  });

export const optionsResponse = () =>
  new Response(null, {
    headers: buildHeaders(),
    status: 204,
  });

export const readRouteParam = async <
  TParams extends RouteParams,
  TKey extends keyof TParams & string,
>(
  context: RouteContext<TParams>,
  key: TKey
) => {
  const params = await context.params;
  const value = params[key];

  if (!value || Array.isArray(value)) {
    throw new Error(`A valid ${key} must be provided`);
  }

  return value;
};
