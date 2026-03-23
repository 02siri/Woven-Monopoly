import { afterEach, describe, expect, it, vi } from 'vitest';
import { request } from './client';

describe('api client', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns response data for successful requests', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          id: 'game-1',
          status: 'IN_PROGRESS',
        },
      }),
    } as Response);

    const result = await request<{ id: string; status: string }>('/games', {
      method: 'GET',
    });

    expect(result).toEqual({
      id: 'game-1',
      status: 'IN_PROGRESS',
    });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/games'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    );
  });

  it('throws the API message for failed requests', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      json: async () => ({
        message: 'Game not found',
      }),
    } as Response);

    await expect(request('/games/missing', { method: 'GET' })).rejects.toThrow(
      'Game not found'
    );
  });
});
