import type { ReactNode } from 'react';
import ModeToggle from '@/core/components/ModeToggle';
import authBg from '@/assets/auth-bg.jpg';

/**
 * Esqueleto das páginas de autenticação (login/register): card centrado na
 * viewport com seletor de tema no canto superior — estas telas ficam fora do
 * AuthenticatedLayout, então não têm Header e precisam carregar o ModeToggle.
 *
 * A viewport é coberta por uma foto de ingredientes (decorativa, aria-hidden)
 * com um véu de `scrim` (o mesmo token do overlay do Dialog) para garantir
 * contraste do card no claro e no escuro; o `light-dark()` do token já ajusta
 * a intensidade da cor por modo.
 *
 * Foto: Unsplash (licença Unsplash) — "Cooking ingredients", @jasonbriscoe:
 * https://unsplash.com/photos/uZSt7P_kp4Y — para trocar, substitua
 * src/assets/auth-bg.jpg mantendo este comentário atualizado.
 */
export default function AuthPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden">
      {/* Fundo decorativo: foto + véu scrim, fixos e cobrindo a viewport
          inteira (as rotas de auth não têm Header/Footer nem padding de main).
          O -z-10 (com isolate na raiz para o negativo não escapar do shell)
          mantém a foto abaixo de children e do ModeToggle sem precisar
          posicioná-los. */}
      <div className="fixed inset-0 -z-10" aria-hidden="true">
        <img src={authBg} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-scrim/60" />
      </div>
      {/* Marca em floater translúcido (mesma receita do pill do ModeToggle):
          sobre superfície, os tokens de texto voltam a funcionar nos dois
          modos. */}
      <h1 className="mb-7 flex items-center gap-[0.65rem] rounded-lg border border-border bg-surface/80 px-5 py-2 font-display text-[1.6rem] font-semibold text-ink-strong shadow-card backdrop-blur-sm">
        <span aria-hidden="true" className="h-[0.6em] w-[0.6em] rotate-45 border-[1.5px] border-lapis" />
        Recipe Notebook
      </h1>
      {children}
      {/* Floater: pill de `surface` translúcida sobre a foto, para o gatilho do
          ModeToggle (sem fundo próprio) ter contraste nos dois modos. */}
      <div className="absolute right-8 top-8 rounded-lg border border-border bg-surface/80 p-1 shadow-card backdrop-blur-sm">
        <ModeToggle />
      </div>
    </div>
  );
}
