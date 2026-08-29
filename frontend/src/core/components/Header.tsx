import Avatar from '@/features/auth/components/Avatar';
import { useAuthStore, useIsAuthenticated } from '@/features/auth/stores/auth';
import { Link } from 'react-router';

const stripe =
  'mt-1 h-0.5 w-0 bg-cobalt transition-[width] duration-250 ease-in-out group-hover:w-full group-focus-within:w-full';

export default function Header() {
  const isAuthenticated = useIsAuthenticated();
  const user = useAuthStore((state) => state.user);

  return (
    <header className="border-b border-border bg-white">
      <div className="page flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-[1.1rem]">
        <Link
          to="/"
          className="inline-flex items-center gap-[0.65rem] font-display text-[1.3rem] font-semibold text-cobalt-ink no-underline"
        >
          <span aria-hidden="true" className="h-[0.6em] w-[0.6em] rotate-45 border-[1.5px] border-cobalt" />
          Recipe Notebook
        </Link>
        <nav aria-label="Main" className="flex gap-7 items-center">
          <div className="group flex flex-col items-center">
            <Link to="/" className="text-[0.95rem] font-semibold text-ink no-underline hover:text-cobalt">
              Recipes
            </Link>
            <div aria-hidden="true" className={stripe} />
          </div>
          {!isAuthenticated && (
            <div className="group flex flex-col items-center">
              <Link to="/login" className="text-[0.95rem] font-semibold text-ink no-underline hover:text-cobalt">
                Sign in
              </Link>
              <div aria-hidden="true" className={stripe} />
            </div>
          )}
          {isAuthenticated && user !== null && (
            <div className="flex flex-col items-center">
              <Avatar user={user} />
              <div aria-hidden="true" className="mt-1 h-0.5" />
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}