import { useEffect } from 'react';
import { Outlet } from 'react-router';
import { useAuthStore } from '@/features/auth/stores/auth';
import { Toaster } from '../components/ui/Toaster';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function MainLayout() {
  const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser);

  useEffect(() => {
    void fetchCurrentUser();
  }, [fetchCurrentUser]);

  return (
    <Toaster>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="*:animate-rise flex-1 pt-8 pb-16">
          <Outlet />
        </main>
        <Footer />
      </div>
    </Toaster>
  );
}