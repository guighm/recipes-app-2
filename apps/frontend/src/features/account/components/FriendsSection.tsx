import ErrorMessage from '@/core/components/ErrorMessage';
import { Button } from '@/core/components/ui/Button';
import { TextField } from '@/core/components/ui/Field';
import { ConfirmDialog } from '@/core/components/ui/AlertDialog';
import { useToast } from '@/core/components/ui/useToast';
import { apiFetch, errorMessage, resolveAssetUrl } from '@/core/config/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { AddFriendDTO, FriendDTO } from '../types/account';

const addFriendSchema = z.object({
  friendId: z.number({ message: 'Enter a user id.' }).int().min(1, 'Enter a valid user id.'),
});

export default function FriendsSection() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [apiError, setApiError] = useState<string | null>(null);
  const [friendIdToRemove, setFriendIdToRemove] = useState<number | null>(null);

  const {
    data: friends,
    isLoading,
    error: listError,
  } = useQuery({
    queryKey: ['friends'],
    queryFn: () => apiFetch<FriendDTO[]>('/users/me/friends'),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<AddFriendDTO>({
    resolver: zodResolver(addFriendSchema),
    mode: 'onTouched',
  });

  const addMutation = useMutation({
    mutationFn: (dto: AddFriendDTO) =>
      apiFetch<FriendDTO>('/users/me/friends', { method: 'POST', body: JSON.stringify(dto) }),
    onSuccess: (friend) => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      toast.success({ title: 'Friend added', description: friend.name });
      reset();
    },
    onError: (error) => {
      setApiError(errorMessage(error));
    },
  });

  const removeMutation = useMutation({
    mutationFn: (friendId: number) =>
      apiFetch<void>(`/users/me/friends/${friendId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      setFriendIdToRemove(null);
      toast.success({ title: 'Friend removed' });
    },
    onError: (error) => {
      toast.error({ title: 'Failed to remove friend', description: errorMessage(error) });
    },
  });

  const onSubmit = (dto: AddFriendDTO) => {
    setApiError(null);
    addMutation.mutate(dto);
  };

  return (
    <section className="flex flex-col gap-[1.1rem] rounded-xl border border-border bg-white px-[1.8rem] py-[1.6rem] shadow-card">
      <h2 className="text-[1.3rem]">Friends</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="flex items-start gap-3">
        <TextField
          label="User id"
          type="number"
          placeholder="E.g. 12"
          className="flex-1"
          registration={register('friendId', { valueAsNumber: true })}
          error={errors.friendId?.message}
        />
        <Button type="submit" variant="primary" compact className="mt-[1.55rem]" disabled={!isValid || isSubmitting}>
          {isSubmitting ? 'Adding…' : 'Add'}
        </Button>
      </form>
      {apiError && <ErrorMessage message={apiError} />}

      {isLoading && <p className="text-[0.9rem] text-ink-soft">Loading friends…</p>}
      {listError && <ErrorMessage message={errorMessage(listError)} />}

      {friends && friends.length === 0 && (
        <p className="text-[0.9rem] text-ink-soft">No friends added yet.</p>
      )}

      {friends && friends.length > 0 && (
        <ul className="flex flex-col gap-2">
          {friends.map((friend) => (
            <li
              key={friend.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border px-[0.9rem] py-[0.6rem]"
            >
              <div className="flex items-center gap-2.5">
                <img
                  src={resolveAssetUrl(friend.avatarUrl)}
                  alt={friend.name}
                  className="h-8 w-8 rounded-full border border-border object-cover"
                />
                <span className="text-[0.92rem] font-medium text-ink">{friend.name}</span>
                <span className="text-[0.75rem] text-ink-soft">#{friend.id}</span>
              </div>
              <Button
                type="button"
                variant="danger"
                compact
                onClick={() => setFriendIdToRemove(friend.id)}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={friendIdToRemove !== null}
        onOpenChange={(open) => {
          if (!open) setFriendIdToRemove(null);
        }}
        title="Remove friend"
        description="You will no longer see each other in your friends list."
        confirmLabel="Remove"
        destructive
        pending={removeMutation.isPending}
        pendingLabel="Removing…"
        onConfirm={() => {
          if (friendIdToRemove !== null) removeMutation.mutate(friendIdToRemove);
        }}
      />
    </section>
  );
}
