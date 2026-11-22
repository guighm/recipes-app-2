import { Outlet } from 'react-router';
import Header from '../components/Header';
import Footer from '../components/Footer';

/**
 * Esqueleto das rotas autenticadas: Header + conteúdo + Footer.
 * O redirecionamento de deslogados fica por conta do <PrivateRoute>
 * no `routes.tsx`, que envolve este layout.
 */
export default function AuthenticatedLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="*:animate-rise flex-1 pt-8 pb-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
