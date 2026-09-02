import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router';
import { ApiError } from '../lib/api';
import { useAuthStore } from '../stores/auth';
import type { LoginDTO } from '../models/user';
import Asterisco from './Asterisco';
import { Button } from './Button';
import ErrorMessage from './ErrorMessage';

const loginSchema = z.object({
  email: z.string().min(1, 'Campo Obrigatório!').email('Inserir e-mail válido!'),
  password: z.string().min(1, 'Campo Obrigatório!'),
});

export default function LoginForm() {
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
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
      navigate('/');
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setApiError('E-mail ou senha inválidos.');
      } else {
        setApiError('Falha de conexão com o servidor.');
      }
    }
  };

  return (
    <section className="mx-auto flex w-[min(430px,100%)] flex-col gap-[1.3rem] rounded-xl border border-borda bg-branco px-[2.2rem] py-8 shadow-sombra">
      <h2 className="text-[1.65rem]">Entrar</h2>
      <p className="mt-[-0.6rem] text-[0.8rem] text-tinta-suave">
        Os campos obrigatórios estão marcados (<Asterisco />)
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[1.1rem]">
        <div className="flex flex-col items-stretch gap-1.5">
          <label htmlFor="email" className="rotulo text-[0.72rem] font-medium text-tinta-suave">
            E-mail <Asterisco />
          </label>
          <input type="email" id="email" placeholder="seu@email.com" {...register('email')} />
          <ErrorMessage message={errors.email?.message} />
        </div>
        <div className="flex flex-col items-stretch gap-1.5">
          <label htmlFor="password" className="rotulo text-[0.72rem] font-medium text-tinta-suave">
            Senha <Asterisco />
          </label>
          <input type="password" id="password" placeholder="Sua senha" {...register('password')} />
          <ErrorMessage message={errors.password?.message} />
        </div>
        <Button type="submit" variant="primario" disabled={!isValid || isSubmitting}>
          {isSubmitting ? 'Entrando…' : 'Entrar'}
        </Button>
        {apiError && <ErrorMessage message={apiError} />}
        <p className="mt-1.5 text-[0.95rem] text-tinta-suave">
          Não tem cadastro? <Link to="/register" className="font-semibold text-cobalto">Cadastre-se</Link>
        </p>
      </form>
    </section>
  );
}