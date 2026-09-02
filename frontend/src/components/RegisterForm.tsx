import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router';
import { ApiError, apiFetch } from '../lib/api';
import type { RegisterDTO } from '../models/user';
import Asterisco from './Asterisco';
import { Button } from './Button';
import ErrorMessage from './ErrorMessage';

// Espelha o CreateUserDto do backend: todos os campos são obrigatórios.
const registerSchema = z.object({
  name: z.string().min(1, 'Campo Obrigatório!'),
  email: z.string().min(1, 'Campo Obrigatório!').email('Inserir e-mail válido!'),
  password: z.string().min(6, 'Mínimo de 6 caracteres!'),
  avatarUrl: z.string().min(1, 'Campo Obrigatório!'),
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
      if (error instanceof ApiError) {
        setApiError(error.message);
      } else {
        setApiError('Falha de conexão com o servidor.');
      }
    }
  };

  return (
    <section className="mx-auto flex w-[min(430px,100%)] flex-col gap-[1.3rem] rounded-xl border border-borda bg-branco px-[2.2rem] py-8 shadow-sombra">
      <h2 className="text-[1.65rem]">Criar sua conta</h2>
      <p className="mt-[-0.6rem] text-[0.8rem] text-tinta-suave">
        Os campos obrigatórios estão marcados (<Asterisco />)
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[1.1rem]">
        <div className="flex flex-col items-stretch gap-1.5">
          <label htmlFor="name" className="rotulo text-[0.72rem] font-medium text-tinta-suave">
            Nome <Asterisco />
          </label>
          <input type="text" id="name" placeholder="Seu nome" {...register('name')} />
          <ErrorMessage message={errors.name?.message} />
        </div>
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
          <input type="password" id="password" placeholder="Mínimo de 6 caracteres" {...register('password')} />
          <ErrorMessage message={errors.password?.message} />
        </div>
        <div className="flex flex-col items-stretch gap-1.5">
          <label htmlFor="avatarUrl" className="rotulo text-[0.72rem] font-medium text-tinta-suave">
            URL do avatar <Asterisco />
          </label>
          <input type="text" id="avatarUrl" placeholder="https://…" {...register('avatarUrl')} />
          <ErrorMessage message={errors.avatarUrl?.message} />
        </div>
        <Button type="submit" variant="primario" disabled={!isValid || isSubmitting}>
          {isSubmitting ? 'Criando conta…' : 'Criar conta'}
        </Button>
        {apiError && <ErrorMessage message={apiError} />}
        <p className="mt-1.5 text-[0.95rem] text-tinta-suave">
          Já possui cadastro? <Link to="/login" className="font-semibold text-cobalto">Fazer login</Link>
        </p>
      </form>
    </section>
  );
}