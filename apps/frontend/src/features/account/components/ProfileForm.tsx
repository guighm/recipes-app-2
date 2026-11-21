import ErrorMessage from '@/core/components/ErrorMessage';
import { Button } from '@/core/components/ui/Button';
import { TextField } from '@/core/components/ui/Field';
import { useToast } from '@/core/components/ui/useToast';
import { apiFetch, errorMessage } from '@/core/config/api';
import { useAuthStore } from '@/features/auth/stores/auth';
import type { UserDTO } from '@/features/auth/types/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { EMAIL_MAX_LENGTH, EMAIL_PATTERN } from '@/core/validation/email';

const NAME_MAX_LENGTH = 255;

const profileSchema = z.object({
  name: z.string().min(1, 'This field is required.').max(NAME_MAX_LENGTH),
  email: z
    .string()
    .min(1, 'This field is required.')
    .max(EMAIL_MAX_LENGTH)
    .regex(EMAIL_PATTERN, 'Enter a valid e-mail.'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfileForm({ user }: { user: UserDTO }) {
  const toast = useToast();
  const setUser = useAuthStore((state) => state.setUser);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    mode: 'onTouched',
    defaultValues: { name: user.name, email: user.email },
  });

  const updateMutation = useMutation({
    mutationFn: (dto: ProfileFormValues) =>
      apiFetch<UserDTO>('/users/me', { method: 'PATCH', body: JSON.stringify(dto) }),
    onSuccess: (updated) => {
      setUser(updated);
      toast.success({ title: 'Profile updated' });
    },
    onError: (error) => {
      setApiError(errorMessage(error));
    },
  });

  const onSubmit = (dto: ProfileFormValues) => {
    setApiError(null);
    updateMutation.mutate(dto);
  };

  return (
    <section className="flex flex-col gap-[1.1rem] rounded-xl border border-border bg-white px-[1.8rem] py-[1.6rem] shadow-card">
      <h2 className="text-[1.3rem]">Profile</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[1.1rem]">
        <TextField
          label="Name"
          required
          maxLength={NAME_MAX_LENGTH}
          registration={register('name')}
          error={errors.name?.message}
        />
        <TextField
          label="E-mail"
          type="email"
          required
          maxLength={EMAIL_MAX_LENGTH}
          registration={register('email')}
          error={errors.email?.message}
        />
        <Button
          type="submit"
          variant="primary"
          compact
          className="self-start"
          disabled={!isValid || !isDirty || isSubmitting}
        >
          {isSubmitting ? 'Saving…' : 'Save changes'}
        </Button>
        {apiError && <ErrorMessage message={apiError} />}
      </form>
    </section>
  );
}
