import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';

// ---- Mock axios ----
vi.mock('axios', () => {
  return {
    default: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
  };
});

import axios from 'axios';
import api from '../../api/http';

type AxiosLike = {
  get: Mock; post: Mock; put: Mock; delete: Mock;
};

const ax = axios as unknown as AxiosLike;

const okResp = <T,>(data: T, status = 200, headers: Record<string, unknown> = { 'x': '1' }) => ({
  data,
  status,
  headers,
});

const errWithResponse = <T,>(data: T, status = 400, headers: Record<string, unknown> = { e: '1' }) => ({
  response: { data, status, headers },
});

const errNoResponse = (message = 'Network Error') => ({
  message,
});

describe('api wrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('resolves with {data, headers, status} and merges default config', async () => {
      ax.get.mockResolvedValueOnce(okResp({ hello: 'world' }, 200, { a: 'b' }));

      const res = await api.get<{ hello: string }>('/users', { headers: { Authorization: 'token' } });

      // maps fields correctly
      expect(res).toEqual({
        data: { hello: 'world' },
        headers: { a: 'b' },
        status: 200,
      });

      // called with merged config (default timeout + provided header)
      expect(ax.get).toHaveBeenCalledWith('/users', expect.objectContaining({
        timeout: 300000,
        headers: { Authorization: 'token' },
      }));
    });

    it('uses default timeout when no config provided', async () => {
      ax.get.mockResolvedValueOnce(okResp({ ok: true }, 200, {}));

      await api.get<{ ok: boolean }>('/ping');

      expect(ax.get).toHaveBeenCalledWith('/ping', expect.objectContaining({ timeout: 300000 }));
    });

    it('rejects with mapped response when axios error has response', async () => {
      ax.get.mockRejectedValueOnce(errWithResponse({ error: 'bad' }, 400, { h: 'x' }));

      await expect(api.get('/fail')).rejects.toEqual({
        data: { error: 'bad' },
        headers: { h: 'x' },
        status: 400,
      });
    });

    it('rejects with {message} when axios error has no response (network error)', async () => {
      ax.get.mockRejectedValueOnce(errNoResponse('Network Error'));

      await expect(api.get('/network')).rejects.toEqual({
        message: 'Network Error',
      });
    });
  });

  describe('POST', () => {
    it('resolves and merges config', async () => {
      ax.post.mockResolvedValueOnce(okResp({ created: 1 }, 201, { h: 'y' }));

      const res = await api.post<{ created: number }>(
        '/items',
        { name: 'A' },
        { headers: { 'X-Trace': '1' }, timeout: 1234 } // override + merge
      );

      expect(res).toEqual({
        data: { created: 1 },
        headers: { h: 'y' },
        status: 201,
      });

      // last write wins (per wrapper: spread default then newConfig)
      expect(ax.post).toHaveBeenCalledWith(
        '/items',
        { name: 'A' },
        expect.objectContaining({ timeout: 1234, headers: { 'X-Trace': '1' } })
      );
    });

    it('rejects with mapped error (no response)', async () => {
      ax.post.mockRejectedValueOnce(errNoResponse('ECONNRESET'));
      await expect(api.post('/items', { a: 1 })).rejects.toEqual({ message: 'ECONNRESET' });
    });
  });

  describe('PUT', () => {
    it('resolves with mapped fields', async () => {
      ax.put.mockResolvedValueOnce(okResp({ updated: true }, 200, { hd: 1 }));
      const res = await api.put<{ updated: boolean }>('/items/1', { name: 'B' });

      expect(res).toEqual({
        data: { updated: true },
        headers: { hd: 1 },
        status: 200,
      });

      expect(ax.put).toHaveBeenCalledWith(
        '/items/1',
        { name: 'B' },
        expect.objectContaining({ timeout: 300000 })
      );
    });
  });

  describe('DELETE', () => {
    it('resolves with mapped fields', async () => {
      ax.delete.mockResolvedValueOnce(okResp({ deleted: true }, 200, { del: 'ok' }));
      const res = await api.delete<{ deleted: boolean }>('/items/1', { params: { force: 1 } });

      expect(res).toEqual({
        data: { deleted: true },
        headers: { del: 'ok' },
        status: 200,
      });

      expect(ax.delete).toHaveBeenCalledWith(
        '/items/1',
        expect.objectContaining({ timeout: 300000, params: { force: 1 } })
      );
    });

    it('rejects with mapped response on server error', async () => {
      ax.delete.mockRejectedValueOnce(errWithResponse({ msg: 'nope' }, 500, { s: 'err' }));
      await expect(api.delete('/items/2')).rejects.toEqual({
        data: { msg: 'nope' },
        headers: { s: 'err' },
        status: 500,
      });
    });
  });
});
