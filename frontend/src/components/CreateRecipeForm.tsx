import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { ApiError, apiFetch } from '../lib/api';
import type { CreateRecipeDTO } from '../models/recipe';
import Asterisco from './Asterisco';
import ErrorMessage from './ErrorMessage';
import './CreateRecipeForm.css';

const createRecipeSchema = z.object({
  title: z.string().min(1, 'Campo Obrigatório!'),
  description: z.string().min(1, 'Campo Obrigatório!'),
  preparationTime: z.number({ message: 'Campo Obrigatório!' }).int('Campo Obrigatório!').min(1, 'Campo Obrigatório!'),
  servings: z.number({ message: 'Campo Obrigatório!' }).int('Campo Obrigatório!').min(1, 'Campo Obrigatório!'),
  difficulty: z.string().min(1, 'Campo Obrigatório!'),
  imageUrl: z.string().min(1, 'Campo Obrigatório!'),
});

export default function CreateRecipeForm() {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm<CreateRecipeDTO>({
    resolver: zodResolver(createRecipeSchema),
    mode: 'onTouched',
  });

  const imageUrl = watch('imageUrl');

  const createMutation = useMutation({
    mutationFn: (dto: CreateRecipeDTO) =>
      apiFetch<void>('/recipes', {
        method: 'POST',
        body: JSON.stringify(dto),
      }),
    onSuccess: () => navigate('/'),
    onError: (error) => {
      if (error instanceof ApiError) {
        setApiError(error.message);
      } else {
        setApiError('Falha de conexão com o servidor.');
      }
    },
  });

  const onSubmit = (dto: CreateRecipeDTO) => {
    setApiError(null);
    createMutation.mutate(dto);
  };

  return (
    <section className="create-recipe-form">
      <h2>Cadastre uma nova receita</h2>
      {imageUrl && <img src={imageUrl} alt="Pré-visualização da imagem da receita" />}
      <form onSubmit={handleSubmit(onSubmit)} className="formulario">
        <div className="campo">
          <label htmlFor="title">Título: <Asterisco /></label>
          <input type="text" id="title" placeholder="Título" {...register('title')} />
          <ErrorMessage message={errors.title?.message} />
        </div>
        <div className="campo">
          <label htmlFor="description">Descrição: <Asterisco /></label>
          <input type="text" id="description" placeholder="Descrição" {...register('description')} />
          <ErrorMessage message={errors.description?.message} />
        </div>
        <div className="campo">
          <label htmlFor="preparationTime">Tempo de Preparação: <Asterisco /> </label>
          <input type="number" id="preparationTime" placeholder="Tempo de Preparação" {...register('preparationTime', { valueAsNumber: true })} />
          <ErrorMessage message={errors.preparationTime?.message} />
        </div>
        <div className="campo">
          <label htmlFor="servings">Número de porções: <Asterisco /> </label>
          <input type="number" id="servings" placeholder="Número de Porções" {...register('servings', { valueAsNumber: true })} />
          <ErrorMessage message={errors.servings?.message} />
        </div>
        <div className="campo">
          <label htmlFor="difficulty">Dificuldade: <Asterisco /> </label>
          <input type="text" id="difficulty" placeholder="Dificuldade" {...register('difficulty')} />
          <ErrorMessage message={errors.difficulty?.message} />
        </div>
        <div className="campo">
          <label htmlFor="imageUrl">Imagem: <Asterisco /> </label>
          <input type="text" id="imageUrl" placeholder="Imagem" {...register('imageUrl')} />
          <ErrorMessage message={errors.imageUrl?.message} />
        </div>
        <button type="submit" disabled={!isValid || isSubmitting}>
          {isSubmitting ? 'Enviando…' : 'Enviar'}
        </button>
        {apiError && <p className="erro-api">{apiError}</p>}
      </form>
      <p className="observacao">Os campos obrigatórios estão marcados (<Asterisco />)</p>
    </section>
  );
}