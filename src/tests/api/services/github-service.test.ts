import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import http from '../../../api/http';
import githubService from '../../../api/services/github-service';

// Mock the http module that the service imports
vi.mock('../../../api/http', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('githubServices', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getListUsers', () => {
    it('calls http.get with username and default perPage=5', async () => {
      (http.get as Mock).mockResolvedValueOnce({ data: { ok: true } });

      const res = await githubService.getListUsers('octocat');

      expect(http.get).toHaveBeenCalledTimes(1);
      expect(http.get).toHaveBeenCalledWith(
        'https://api.github.com/search/users?q=octocat+in:login&per_page=5'
      );
      expect(res).toEqual({ data: { ok: true } });
    });

    it('calls http.get with custom perPage', async () => {
      (http.get as Mock).mockResolvedValueOnce({ data: { total: 10 } });

      await githubService.getListUsers('octocat', 10);

      expect(http.get).toHaveBeenCalledWith(
        'https://api.github.com/search/users?q=octocat+in:login&per_page=10'
      );
    });

    it('calls http.get without username (null) and keeps perPage', async () => {
      (http.get as Mock).mockResolvedValueOnce({ data: { total: 0 } });

      await githubService.getListUsers(null, 3);

      expect(http.get).toHaveBeenCalledWith(
        'https://api.github.com/search/users?per_page=3'
      );
    });

    it('propagates http errors (rejects)', async () => {
      (http.get as Mock).mockRejectedValueOnce(new Error('network'));

      await expect(githubService.getListUsers('octocat')).rejects.toThrow('network');
    });
  });

  describe('getRepositoriesByUser', () => {
    it('calls http.get with the repos endpoint', async () => {
      (http.get as Mock).mockResolvedValueOnce({ data: [{ id: 1 }] });

      const res = await githubService.getRepositoriesByUser('octocat');

      expect(http.get).toHaveBeenCalledTimes(1);
      expect(http.get).toHaveBeenCalledWith(
        'https://api.github.com/users/octocat/repos'
      );
      expect(res).toEqual({ data: [{ id: 1 }] });
    });

    it('propagates http errors (rejects)', async () => {
      (http.get as Mock).mockRejectedValueOnce(new Error('bad'));

      await expect(githubService.getRepositoriesByUser('octocat')).rejects.toThrow('bad');
    });
  });
});
