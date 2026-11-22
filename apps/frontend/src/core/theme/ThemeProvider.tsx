import { useSyncExternalStore, type ReactNode } from 'react';
import { subscribeToColorScheme, systemPrefersDark } from './store';

/**
 * O tema vive no store Zustand de `./store` (acesse com `useTheme`); o
 * provider não passa estado via contexto. Fica na árvore para assinar as
 * mudanças de `prefers-color-scheme` do SO enquanto `mode === 'system'` —
 * em `system` nenhuma classe é aplicada e o CSS nativo resolve o modo.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  useSyncExternalStore(subscribeToColorScheme, systemPrefersDark);

  return <>{children}</>;
}
