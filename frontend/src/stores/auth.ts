import { create } from 'zustand';
import { apiFetch, TOKEN_KEY } from '../lib/api';
import type { JwtDTO, LoginDTO } from '../models/user';

interface AuthState {
  token: string | null;
  login: (dto: LoginDTO) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem(TOKEN_KEY),
  login: async (dto) => {
    const jwt = await apiFetch<JwtDTO>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    localStorage.setItem(TOKEN_KEY, jwt.accessToken);
    set({ token: jwt.accessToken });
  },
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({ token: null });
  },
}));

export const useIsAuthenticated = () => useAuthStore((state) => state.token !== null);