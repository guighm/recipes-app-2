import { useSyncExternalStore } from 'react';
import { create } from 'zustand';

/**
 * Estado do tema. `system` segue a preferência do SO — nesse caso nenhuma
 * classe é aplicada ao <html> e o CSS nativo resolve via
 * `prefers-color-scheme` (ver `@layer base` em `src/app/globals.css`).
 */
export type ThemeMode = 'system' | 'light' | 'dark';

const THEME_KEY = 'theme';

function readStoredMode(): ThemeMode {
  const stored = localStorage.getItem(THEME_KEY);
  return stored === 'light' || stored === 'dark' ? stored : 'system';
}

/** Espelha o contrato do seletor de tema do globals.css. */
function applyTheme(mode: ThemeMode): void {
  const root = document.documentElement;
  root.classList.toggle('dark', mode === 'dark');
  root.classList.toggle('light', mode === 'light');
}

export function systemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function resolveMode(mode: ThemeMode): 'light' | 'dark' {
  return mode === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : mode;
}

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

// Aplica a classe do tema armazenado ainda na importação do módulo (antes do
// render do React), evitando flash do tema errado em recarregamentos.
const initialMode = readStoredMode();
applyTheme(initialMode);

export const useThemeStore = create<ThemeState>((set) => ({
  mode: initialMode,
  setMode: (mode) => {
    localStorage.setItem(THEME_KEY, mode);
    applyTheme(mode);
    set({ mode });
  },
}));

export function subscribeToColorScheme(onChange: () => void): () => void {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', onChange);
  return () => mediaQuery.removeEventListener('change', onChange);
}

/**
 * Acessa o tema com o modo resolvido. Reativo: enquanto `mode === 'system'`,
 * `resolvedMode` acompanha mudanças de `prefers-color-scheme` do SO.
 */
export function useTheme() {
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);
  const systemDark = useSyncExternalStore(subscribeToColorScheme, systemPrefersDark);

  const resolvedMode = mode === 'system' ? (systemDark ? 'dark' : 'light') : mode;
  return { mode, resolvedMode, setMode };
}
