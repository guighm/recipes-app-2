import { Button } from '@/core/components/ui/Button';
import { ConfirmDialog } from '@/core/components/ui/AlertDialog';
import { useToast } from '@/core/components/ui/useToast';
import { apiFetch, errorMessage } from '@/core/config/api';
import { useAuthStore } from '@/features/auth/stores/auth';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router';

export default function DeleteAccountSection() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const toast = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => apiFetch<void>('/users/me', { method: 'DELETE' }),
    onSuccess: () => {
      logout();
      navigate('/login');
      toast.success({ title: 'Account deleted' });
    },
    onError: (error) => {
      toast.error({ title: 'Failed to delete account', description: errorMessage(error) });
    },
  });

  return (
    <section className="flex flex-col gap-[1.1rem] rounded-xl border border-error/40 bg-error-mist/30 px-[1.8rem] py-[1.6rem]">
      <h2 className="text-[1.3rem]">Delete account</h2>
      <p className="text-[0.9rem] text-ink-soft">
        Permanently deletes your account, recipes, and friend list. This cannot be undone.
      </p>
      <Button
        type="button"
        variant="danger"
        compact
        className="self-start"
        onClick={() => setConfirmOpen(true)}
      >
        Delete my account
      </Button>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete account"
        description="This action is permanent: your account, recipes, and friend list will be gone forever."
        confirmLabel="Delete account"
        destructive
        pending={deleteMutation.isPending}
        pendingLabel="Deleting…"
        onConfirm={() => deleteMutation.mutate()}
      />
    </section>
  );
}
