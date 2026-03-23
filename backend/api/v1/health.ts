import { jsonResponse, optionsResponse } from '../../src/lib/http';

export function OPTIONS() {
  return optionsResponse();
}

export function GET() {
  return jsonResponse(
    {
      message: 'Woven Monopoly backend is running',
      status: 'ok',
    },
    { status: 200 }
  );
}
