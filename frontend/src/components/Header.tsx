import { Link } from 'react-router';
import { useIsAuthenticated } from '../stores/auth';

const listra =
  'mt-1 h-0.5 w-0 bg-cobalto transition-[width] duration-250 ease-in-out group-hover:w-full group-focus-within:w-full';

export default function Header() {
  const isAuthenticated = useIsAuthenticated();

  return (
    <header className="border-b border-borda bg-branco">
      <div className="pagina flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-[1.1rem]">
        <Link
          to="/"
          className="inline-flex items-center gap-[0.65rem] font-display text-[1.3rem] font-semibold text-cobalto-tinta no-underline"
        >
          <span aria-hidden="true" className="h-[0.6em] w-[0.6em] rotate-45 border-[1.5px] border-cobalto" />
          Caderno de Receitas
        </Link>
        <nav aria-label="Principal" className="flex gap-7">
          <div className="group flex flex-col items-center">
            <Link to="/" className="text-[0.95rem] font-semibold text-tinta no-underline hover:text-cobalto">
              Receitas
            </Link>
            <div aria-hidden="true" className={listra} />
          </div>
          {!isAuthenticated && (
            <div className="group flex flex-col items-center">
              <Link to="/login" className="text-[0.95rem] font-semibold text-tinta no-underline hover:text-cobalto">
                Entrar
              </Link>
              <div aria-hidden="true" className={listra} />
            </div>
          )}
        </nav>
      </div>
      {/* <div aria-hidden="true" className="friso" /> */}
    </header>
  );
}