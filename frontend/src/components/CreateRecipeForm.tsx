import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { ApiError, apiFetch } from '../lib/api';
import type { CreateRecipeDTO } from '../models/recipe';
import Asterisco from './Asterisco';
import { Button } from './Button';
import ErrorMessage from './ErrorMessage';

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
    <section className="mx-auto flex w-[min(560px,100%)] flex-col gap-[1.3rem] rounded-xl border border-borda bg-branco px-[2.2rem] py-8 shadow-sombra">
      <h2 className="text-[1.65rem]">Nova receita</h2>
      <p className="mt-[-0.6rem] text-[0.8rem] text-tinta-suave">
        Preencha os detalhes do prato. Os campos obrigatórios estão marcados (<Asterisco />)
      </p>
      {imageUrl && (
        <figure className="flex flex-col gap-1.5">
          <img
            className="aspect-video w-full rounded-lg border border-borda object-cover"
            src={imageUrl}
            alt="Pré-visualização da foto da receita"
          />
          <figcaption className="rotulo text-center text-[0.66rem] text-tinta-suave">Pré-visualização da foto</figcaption>
        </figure>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 items-start gap-[1.1rem] max-[480px]:grid-cols-1">
        <div className="col-span-full flex flex-col items-stretch gap-1.5">
          <label htmlFor="title" className="rotulo text-[0.72rem] font-medium text-tinta-suave">
            Título <Asterisco />
          </label>
          <input type="text" id="title" placeholder="Ex.: Bolo de cenoura da vovó" {...register('title')} />
          <ErrorMessage message={errors.title?.message} />
        </div>
        <div className="col-span-full flex flex-col items-stretch gap-1.5">
          <label htmlFor="description" className="rotulo text-[0.72rem] font-medium text-tinta-suave">
            Descrição <Asterisco />
          </label>
          <input type="text" id="description" placeholder="Uma frase sobre o prato" {...register('description')} />
          <ErrorMessage message={errors.description?.message} />
        </div>
        <div className="flex flex-col items-stretch gap-1.5">
          <label htmlFor="preparationTime" className="rotulo text-[0.72rem] font-medium text-tinta-suave">
            Tempo de preparo (min) <Asterisco />
          </label>
          <input
            type="number"
            id="preparationTime"
            placeholder="Ex.: 45"
            {...register('preparationTime', { valueAsNumber: true })}
          />
          <ErrorMessage message={errors.preparationTime?.message} />
        </div>
        <div className="flex flex-col items-stretch gap-1.5">
          <label htmlFor="servings" className="rotulo text-[0.72rem] font-medium text-tinta-suave">
            Porções <Asterisco />
          </label>
          <input
            type="number"
            id="servings"
            placeholder="Ex.: 4"
            {...register('servings', { valueAsNumber: true })}
          />
          <ErrorMessage message={errors.servings?.message} />
        </div>
        <div className="flex flex-col items-stretch gap-1.5">
          <label htmlFor="difficulty" className="rotulo text-[0.72rem] font-medium text-tinta-suave">
            Dificuldade <Asterisco />
          </label>
          <input type="text" id="difficulty" placeholder="Ex.: Fácil" {...register('difficulty')} />
          <ErrorMessage message={errors.difficulty?.message} />
        </div>
        <div className="flex flex-col items-stretch gap-1.5">
          <label htmlFor="imageUrl" className="rotulo text-[0.72rem] font-medium text-tinta-suave">
            URL da foto <Asterisco />
          </label>
          <input type="text" id="imageUrl" placeholder="https://…" {...register('imageUrl')} />
          <ErrorMessage message={errors.imageUrl?.message} />
        </div>
        <Button
          type="submit"
          variant="primario"
          className="col-span-full"
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? 'Publicando…' : 'Publicar receita'}
        </Button>
        {apiError && <ErrorMessage message={apiError} className="col-span-full" />}
      </form>
    </section>
  );
}