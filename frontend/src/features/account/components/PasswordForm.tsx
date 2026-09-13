import ErrorMessage from '@/core/components/ErrorMessage';
import { Button } from '@/core/components/ui/Button';
import { TextField } from '@/core/components/ui/Field';
import { useToast } from '@/core/components/ui/useToast';
import { apiFetch, errorMessage } from '@/core/config/api';
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_PATTERN,
  PASSWORD_PATTERN_MESSAGE,
} from '@/core/validation/password';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { ChangePasswordDTO } from '../types/account';

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'This field is required.').max(PASSWORD_MAX_LENGTH),
    newPassword: z
      .string()
      .min(PASSWORD_MIN_LENGTH, `Minimum of ${PASSWORD_MIN_LENGTH} characters.`)
      .max(PASSWORD_MAX_LENGTH)
      .regex(PASSWORD_PATTERN, PASSWORD_PATTERN_MESSAGE),
    confirmNewPassword: z.string().min(1, 'This field is required.'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match.',
    path: ['confirmNewPassword'],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: 'New password must be different from your current password.',
    path: ['newPassword'],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function PasswordForm() {
  const toast = useToast();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    mode: 'onTouched',
  });

  const changePasswordMutation = useMutation({
    mutationFn: (dto: ChangePasswordDTO) =>
      apiFetch<void>('/users/me/password', { method: 'PATCH', body: JSON.stringify(dto) }),
    onSuccess: () => {
      toast.success({ title: 'Password changed' });
      reset();
    },
    onError: (error) => {
      setApiError(errorMessage(error, 'That password was already used on this account.'));
    },
  });

  const onSubmit = (values: PasswordFormValues) => {
    setApiError(null);
    changePasswordMutation.mutate({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
  };

  return (
    <section className="flex flex-col gap-[1.1rem] rounded-xl border border-border bg-white px-[1.8rem] py-[1.6rem] shadow-card">
      <h2 className="text-[1.3rem]">Password</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[1.1rem]">
        <TextField
          label="Current password"
          type="password"
          required
          maxLength={PASSWORD_MAX_LENGTH}
          registration={register('currentPassword')}
          error={errors.currentPassword?.message}
        />
        <TextField
          label="New password"
          type="password"
          placeholder={`Minimum of ${PASSWORD_MIN_LENGTH} characters, with upper/lowercase, a number and a symbol`}
          required
          maxLength={PASSWORD_MAX_LENGTH}
          registration={register('newPassword')}
          error={errors.newPassword?.message}
        />
        <TextField
          label="Confirm new password"
          type="password"
          required
          maxLength={PASSWORD_MAX_LENGTH}
          registration={register('confirmNewPassword')}
          error={errors.confirmNewPassword?.message}
        />
        <Button
          type="submit"
          variant="primary"
          compact
          className="self-start"
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? 'Changing…' : 'Change password'}
        </Button>
        {apiError && <ErrorMessage message={apiError} />}
      </form>
    </section>
  );
}
