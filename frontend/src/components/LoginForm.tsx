import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router';
import { ApiError } from '../lib/api';
import { useAuthStore } from '../stores/auth';
import type { LoginDTO } from '../models/user';
import Asterisco from './Asterisco';
import ErrorMessage from './ErrorMessage';
import './LoginForm.css';

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
    <section className="login-form">
      <h2>Faça login</h2>
      <p className="observacao">Os campos obrigatórios estão marcados (<Asterisco />)</p>
      <form onSubmit={handleSubmit(onSubmit)} className="formulario">
        <div className="campo">
          <label htmlFor="email">E-mail: <Asterisco /></label>
          <input type="email" id="email" placeholder="E-mail" {...register('email')} />
          <ErrorMessage message={errors.email?.message} />
        </div>
        <div className="campo">
          <label htmlFor="password">Senha: <Asterisco /> </label>
          <input type="password" id="password" placeholder="Senha" {...register('password')} />
          <ErrorMessage message={errors.password?.message} />
        </div>
        <button type="submit" disabled={!isValid || isSubmitting}>
          {isSubmitting ? 'Enviando…' : 'Enviar'}
        </button>
        {apiError && <p className="erro-api">{apiError}</p>}
        <p className="aviso">Não tem cadastro? <Link to="/register" className="aviso__link">Cadastre-se</Link></p>
      </form>
    </section>
  );
}