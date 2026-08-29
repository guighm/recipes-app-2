import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router';
import { ApiError, apiFetch } from '../lib/api';
import type { RegisterDTO } from '../models/user';
import Asterisco from './Asterisco';
import ErrorMessage from './ErrorMessage';
import './RegisterForm.css';

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
    <section className="register-form">
      <h2>Cadastre-se</h2>
      <p className="observacao">Os campos obrigatórios estão marcados (<Asterisco />)</p>
      <form onSubmit={handleSubmit(onSubmit)} className="formulario">
        <div className="campo">
          <label htmlFor="name">Nome: <Asterisco /></label>
          <input type="text" id="name" placeholder="Nome" {...register('name')} />
          <ErrorMessage message={errors.name?.message} />
        </div>
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
        <div className="campo">
          <label htmlFor="avatarUrl">URL do Avatar: <Asterisco /> </label>
          <input type="text" id="avatarUrl" placeholder="URL do Avatar" {...register('avatarUrl')} />
          <ErrorMessage message={errors.avatarUrl?.message} />
        </div>
        <button type="submit" disabled={!isValid || isSubmitting}>
          {isSubmitting ? 'Enviando…' : 'Enviar'}
        </button>
        {apiError && <p className="erro-api">{apiError}</p>}
        <p className="aviso">Já possui cadastro? <Link to="/login" className="aviso__link">Fazer Login</Link></p>
      </form>
    </section>
  );
}