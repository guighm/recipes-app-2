import Avatar from '@/features/auth/components/Avatar';
import { useAuthStore, useIsAuthenticated } from '@/features/auth/stores/auth';
import { BookOpen, LogOut, User } from 'lucide-react';
import { Link, NavLink } from 'react-router';
import { Menu } from './ui/Menu';
import ModeToggle from './ModeToggle';

/**
 * Listra que cresce no hover/foco do item e fica permanente na rota ativa.
 * O NavLink aplica a classe `active` ao link da rota atual, junto de
 * `aria-current="page"`.
 */
const stripe =
  'mt-1 h-0.5 w-0 bg-lapis transition-[width] duration-250 ease-in-out group-hover:w-full group-focus-within:w-full group-[.active]:w-full';

const textLink =
  'group flex flex-col items-center text-[0.95rem] font-semibold text-ink no-underline hover:text-lapis focus-visible:text-lapis';

export default function Header() {
  const isAuthenticated = useIsAuthenticated();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <header className="border-b border-border bg-surface">
      <div className="page flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-[1.1rem]">
        <Link
          to="/"
          className="inline-flex items-center gap-[0.65rem] font-display text-[1.3rem] font-semibold text-ink-strong no-underline"
        >
          <span aria-hidden="true" className="h-[0.6em] w-[0.6em] rotate-45 border-[1.5px] border-lapis" />
          Recipe Notebook
        </Link>
        <nav aria-label="Main" className="flex items-center gap-7">
          {!isAuthenticated && (
            <NavLink to="/login" className={textLink}>
              Sign in
              <div aria-hidden="true" className={stripe} />
            </NavLink>
          )}
          {isAuthenticated && user !== null && (
            <Menu
              align="end"
              trigger={
                <button
                  type="button"
                  aria-label="Account menu"
                  className="group flex cursor-pointer flex-col items-center rounded-full pt-[0.375rem] outline-none focus-visible:shadow-focus"
                >
                  <Avatar user={user} />
                  <div aria-hidden="true" className={stripe} />
                </button>
              }
              items={[
                { label: 'Account', href: '/account', icon: User },
                { label: 'Recipes', href: '/', icon: BookOpen },
                { label: 'Log out', separatorBefore: true, onSelect: () => logout(), icon: LogOut },
              ]}
            />
          )}
          <ModeToggle />
        </nav>
      </div>
    </header>
  );
}