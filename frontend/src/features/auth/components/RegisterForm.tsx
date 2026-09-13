import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router';
import type { RegisterDTO } from '../types/user';
import { apiFetch, errorMessage } from '@/core/config/api';
import { EMAIL_MAX_LENGTH, EMAIL_PATTERN } from '@/core/validation/email';
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_PATTERN,
  PASSWORD_PATTERN_MESSAGE,
} from '@/core/validation/password';
import Asterisk from '@/core/components/Asterisk';
import { TextField } from '@/core/components/ui/Field';
import { Button } from '@/core/components/ui/Button';
import ErrorMessage from '@/core/components/ErrorMessage';

const NAME_MAX_LENGTH = 255;
const AVATAR_URL_MAX_LENGTH = 255;

// Mirrors the backend's CreateUserDto: every field is required.
const registerSchema = z.object({
  name: z.string().min(1, 'This field is required.').max(NAME_MAX_LENGTH),
  email: z
    .string()
    .min(1, 'This field is required.')
    .max(EMAIL_MAX_LENGTH)
    .regex(EMAIL_PATTERN, 'Enter a valid e-mail.'),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Minimum of ${PASSWORD_MIN_LENGTH} characters.`)
    .max(PASSWORD_MAX_LENGTH)
    .regex(PASSWORD_PATTERN, PASSWORD_PATTERN_MESSAGE),
  avatarUrl: z.string().min(1, 'This field is required.').max(AVATAR_URL_MAX_LENGTH),
});

export default function RegisterForm() {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<RegisterDTO>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
  });

  const onSubmit = async (dto: RegisterDTO) => {
    setApiError(null);
    try {
      await apiFetch('/users/register', {
        method: 'POST',
        body: JSON.stringify(dto),
      });
      navigate('/login');
    } catch (error) {
      setApiError(errorMessage(error));
    }
  };

  return (
    <section className="mx-auto flex w-[min(430px,100%)] flex-col gap-[1.3rem] rounded-xl border border-border bg-white px-[2.2rem] py-8 shadow-card">
      <h2 className="text-[1.65rem]">Create your account</h2>
      <p className="mt-[-0.6rem] text-[0.8rem] text-ink-soft">
        Required fields are marked (<Asterisk />)
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[1.1rem]">
        <TextField
          label="Name"
          placeholder="Your name"
          required
          maxLength={NAME_MAX_LENGTH}
          registration={register('name')}
          error={errors.name?.message}
        />
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
          placeholder={`Minimum of ${PASSWORD_MIN_LENGTH} characters, with upper/lowercase, a number and a symbol`}
          required
          maxLength={PASSWORD_MAX_LENGTH}
          registration={register('password')}
          error={errors.password?.message}
        />
        <TextField
          label="Avatar URL"
          placeholder="https://…"
          required
          maxLength={AVATAR_URL_MAX_LENGTH}
          registration={register('avatarUrl')}
          error={errors.avatarUrl?.message}
        />
        <Button type="submit" variant="primary" disabled={!isValid || isSubmitting}>
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </Button>
        {apiError && <ErrorMessage message={apiError} />}
        <p className="mt-1.5 text-[0.95rem] text-ink-soft">
          Already registered? <Link to="/login" className="font-semibold text-cobalt">Sign in</Link>
        </p>
      </form>
    </section>
  );
}
