import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation, useNavigate } from 'react-router';
import { useAuthStore } from '../stores/auth';
import type { LoginDTO } from '../types/user';
import { ApiError } from '@/core/config/api';
import { EMAIL_MAX_LENGTH } from '@/core/validation/email';
import { PASSWORD_MAX_LENGTH } from '@/core/validation/password';
import Asterisk from '@/core/components/Asterisk';
import { TextField } from '@/core/components/ui/Field';
import { Button } from '@/core/components/ui/Button';
import ErrorMessage from '@/core/components/ErrorMessage';

const loginSchema = z.object({
  email: z.string().min(1, 'This field is required.').email('Enter a valid e-mail.'),
  password: z.string().min(1, 'This field is required.'),
});

export default function LoginForm() {
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/';
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<LoginDTO>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
  });

  const onSubmit = async (dto: LoginDTO) => {
    setApiError(null);
    try {
      await login(dto);
      navigate(from, { replace: true });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setApiError('Invalid e-mail or password.');
      } else {
        setApiError('Server connection failed.');
      }
    }
  };

  return (
    <div className="flex flex-col gap-[1.3rem]">
      <p className="text-[0.8rem] text-ink-soft">
        Required fields are marked (<Asterisk />)
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[1.1rem]">
        <TextField
          label="E-mail"
          type="email"
          placeholder="you@email.com"
          required
          maxLength={EMAIL_MAX_LENGTH}
          registration={register('email')}
          error={errors.email?.message}
        />
        <TextField
          label="Password"
          type="password"
          placeholder="Your password"
          required
          maxLength={PASSWORD_MAX_LENGTH}
          registration={register('password')}
          error={errors.password?.message}
        />
        <Button type="submit" variant="primary" disabled={!isValid || isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>
        {apiError && <ErrorMessage message={apiError} />}
      </form>
    </div>
  );
}