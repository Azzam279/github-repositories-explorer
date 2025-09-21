import { create } from 'zustand';

export const useGithubStore = create((set) => ({
  username: '',
  setUsername: (username: string) => set({ username }),
}));
