import { useEffect } from 'react';
import { Outlet } from 'react-router';
import { useAuthStore } from '@/features/auth/stores/auth';
import { Toaster } from '../components/ui/Toaster';

export default function MainLayout() {
  const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser);

  useEffect(() => {
    void fetchCurrentUser();
  }, [fetchCurrentUser]);

  return (
    <Toaster>
      <Outlet />
    </Toaster>
  );
}