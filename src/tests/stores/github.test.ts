import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

let useGithubStore: typeof import('../../stores/github').useGithubStore;

describe('useGithubStore', () => {
  beforeEach(async () => {
    await vi.resetModules();
    vi.doUnmock('zustand');
    vi.doUnmock('../../stores/github');

    ({ useGithubStore } = await import('../../stores/github'));
  });

  afterEach(() => {
    useGithubStore.setState({ username: '' }, true);
  });

  it('has empty initial username', () => {
    const { result } = renderHook(() => useGithubStore() as { username: string });
    expect(typeof result.current).toBe('object'); // guard
    expect(result.current.username).toBe('');
  });

  it('updates username via action from hook', () => {
    const { result } = renderHook(() => useGithubStore() as { username: string, setUsername: (username: string) => void });

    expect(typeof result.current.setUsername).toBe('function');

    act(() => {
      result.current.setUsername('hubot');
    });

    expect(result.current.username).toBe('hubot');
  });
});
