import Asterisk from '@/core/components/Asterisk';
import ErrorMessage from '@/core/components/ErrorMessage';
import { TextField } from '@/core/components/ui/Field';
import { useToast } from '@/core/components/ui/useToast';
import { apiFetch, errorMessage } from '@/core/config/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { z } from 'zod';
import type { CreateRecipeDTO } from '../types/recipe';
import { Button } from '@/core/components/ui/Button';

const createRecipeSchema = z.object({
  title: z.string().min(1, 'This field is required.'),
  description: z.string().min(1, 'This field is required.'),
  preparationTime: z.number({ message: 'This field is required.' }).int('This field is required.').min(1, 'This field is required.'),
  servings: z.number({ message: 'This field is required.' }).int('This field is required.').min(1, 'This field is required.'),
  difficulty: z.string().min(1, 'This field is required.'),
  imageUrl: z.string().min(1, 'This field is required.'),
});

export default function CreateRecipeForm() {
  const navigate = useNavigate();
  const toast = useToast();
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
    onSuccess: () => {
      toast.success({ title: 'Recipe published', description: 'It already shows up in your notebook.' });
      navigate('/');
    },
    onError: (error) => {
      setApiError(errorMessage(error));
    },
  });

  const onSubmit = (dto: CreateRecipeDTO) => {
    setApiError(null);
    createMutation.mutate(dto);
  };

  return (
    <section className="mx-auto flex w-[min(560px,100%)] flex-col gap-[1.3rem] rounded-xl border border-border bg-white px-[2.2rem] py-8 shadow-card">
      <h2 className="text-[1.65rem]">New recipe</h2>
      <p className="mt-[-0.6rem] text-[0.8rem] text-ink-soft">
        Fill in the dish's details. Required fields are marked (<Asterisk />)
      </p>
      {imageUrl && (
        <figure className="flex flex-col gap-1.5">
          <img
            className="aspect-video w-full rounded-lg border border-border object-cover"
            src={imageUrl}
            alt="Recipe photo preview"
          />
          <figcaption className="label text-center text-[0.66rem] text-ink-soft">Photo preview</figcaption>
        </figure>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 items-start gap-[1.1rem] max-[480px]:grid-cols-1">
        <TextField
          label="Title"
          placeholder="E.g. Grandma's carrot cake"
          required
          className="col-span-full"
          registration={register('title')}
          error={errors.title?.message}
        />
        <TextField
          label="Description"
          placeholder="One sentence about the dish"
          required
          className="col-span-full"
          registration={register('description')}
          error={errors.description?.message}
        />
        <TextField
          label="Preparation time (min)"
          type="number"
          placeholder="E.g. 45"
          required
          registration={register('preparationTime', { valueAsNumber: true })}
          error={errors.preparationTime?.message}
        />
        <TextField
          label="Servings"
          type="number"
          placeholder="E.g. 4"
          required
          registration={register('servings', { valueAsNumber: true })}
          error={errors.servings?.message}
        />
        <TextField
          label="Difficulty"
          placeholder="E.g. Easy"
          required
          registration={register('difficulty')}
          error={errors.difficulty?.message}
        />
        <TextField
          label="Photo URL"
          placeholder="https://…"
          required
          registration={register('imageUrl')}
          error={errors.imageUrl?.message}
        />
        <Button
          type="submit"
          variant="primary"
          className="col-span-full"
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? 'Publishing…' : 'Publish recipe'}
        </Button>
        {apiError && <ErrorMessage message={apiError} className="col-span-full" />}
      </form>
    </section>
  );
}