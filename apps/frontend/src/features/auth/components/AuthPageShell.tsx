import type { ReactNode } from 'react';
import ModeToggle from '@/core/components/ModeToggle';

/**
 * Esqueleto das páginas de autenticação (login/register): card centrado na
 * viewport com o seletor de tema no canto superior — estas telas ficam fora do
 * AuthenticatedLayout, então não têm Header e precisam carregar o ModeToggle.
 */
export default function AuthPageShell({ children }: { children: ReactNode }) {
  // O calc compensa o pt-8 (2rem) + pb-16 (4rem) do <main> em MainLayout,
  // para o centrar considerar a viewport inteira e não só o espaço entre os
  // paddings.
  return (
    <div className="relative flex min-h-[calc(100vh-6rem)] items-center justify-center">
      <div className="absolute right-8 top-8">
        <ModeToggle />
      </div>
      {children}
    </div>
  );
}
