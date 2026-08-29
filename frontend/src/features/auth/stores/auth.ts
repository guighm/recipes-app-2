import { create } from 'zustand';
import type { JwtDTO, LoginDTO, UserDTO } from '../types/user';
import { TOKEN_KEY, apiFetch, ApiError } from '@/core/config/api';

interface AuthState {
  token: string | null;
  user: UserDTO | null;
  login: (dto: LoginDTO) => Promise<void>;
  logout: () => void;
  fetchCurrentUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem(TOKEN_KEY),
  user: null,
  login: async (dto) => {
    const jwt = await apiFetch<JwtDTO>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    localStorage.setItem(TOKEN_KEY, jwt.accessToken);
    set({ token: jwt.accessToken });
    await get().fetchCurrentUser();
  },
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({ token: null, user: null });
  },
  fetchCurrentUser: async () => {
    if (get().token === null) return;
    try {
      const user = await apiFetch<UserDTO>('/auth/me');
      set({ user });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        get().logout();
      }
    }
  },
}));

export const useIsAuthenticated = () => useAuthStore((state) => state.token !== null);