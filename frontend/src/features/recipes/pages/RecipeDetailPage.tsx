import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router';
import { useIsAuthenticated } from '../../auth/stores/auth';
import type { RecipeDTO } from '../types/recipe';
import type { CreateIngredientDTO, IngredientDTO } from '../types/ingredient';
import type { CreateStepDTO, StepDTO } from '../types/step';
import { useToast } from '@/core/components/ui/useToast';
import { apiFetch, errorMessage } from '@/core/config/api';
import { Button, ButtonLink } from '@/core/components/ui/Button';
import ErrorMessage from '@/core/components/ErrorMessage';
import { Dialog } from '@/core/components/ui/Dialog';
import { TextField } from '@/core/components/ui/Field';

interface IngredientFormValues {
  name: string;
  quantity: string;
}

interface StepFormValues {
  stepNumber: number;
  description: string;
}

const ingredientSchema = z.object({
  name: z.string().min(1, 'This field is required.'),
  quantity: z.string().min(1, 'This field is required.'),
});

const stepSchema = z.object({
  stepNumber: z.number({ message: 'This field is required.' }).int('This field is required.').min(1, 'This field is required.'),
  description: z.string().min(1, 'This field is required.'),
});

const sectionClasses = 'rounded-xl border border-border bg-white px-[1.7rem] pt-[1.6rem] pb-[1.7rem] shadow-card';

export default function RecipeDetailPage() {
  const { id } = useParams();
  const recipeId = Number(id);
  const validId = Number.isInteger(recipeId) && recipeId > 0;
  const isAuthenticated = useIsAuthenticated();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [showIngredientForm, setShowIngredientForm] = useState(false);
  const [showStepForm, setShowStepForm] = useState(false);

  const enabled = isAuthenticated && validId;

  const recipeQuery = useQuery({
    queryKey: ['recipe', recipeId],
    queryFn: () => apiFetch<RecipeDTO>(`/recipes/${recipeId}`),
    enabled,
  });

  const ingredientsQuery = useQuery({
    queryKey: ['ingredients', recipeId],
    queryFn: () => apiFetch<IngredientDTO[]>(`/recipes/${recipeId}/ingredients`),
    enabled,
  });

  const stepsQuery = useQuery({
    queryKey: ['steps', recipeId],
    queryFn: () => apiFetch<StepDTO[]>(`/recipes/${recipeId}/steps`),
    enabled,
  });

  const ingredientForm = useForm<IngredientFormValues>({
    resolver: zodResolver(ingredientSchema),
    mode: 'onTouched',
  });

  const stepForm = useForm<StepFormValues>({
    resolver: zodResolver(stepSchema),
    mode: 'onTouched',
  });

  const notifyFailure = (title: string) => (error: unknown) => {
    toast.error({ title, description: errorMessage(error) });
  };

  const addIngredientMutation = useMutation({
    mutationFn: (dto: CreateIngredientDTO) =>
      apiFetch<void>('/ingredients', {
        method: 'POST',
        body: JSON.stringify(dto),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients', recipeId] });
      ingredientForm.reset();
      setShowIngredientForm(false);
      toast.success({ title: 'Ingredient added' });
    },
    onError: notifyFailure('Failed to add the ingredient'),
  });

  const addStepMutation = useMutation({
    mutationFn: (dto: CreateStepDTO) =>
      apiFetch<void>('/steps', {
        method: 'POST',
        body: JSON.stringify(dto),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['steps', recipeId] });
      stepForm.reset();
      setShowStepForm(false);
      toast.success({ title: 'Step added' });
    },
    onError: notifyFailure('Failed to add the step'),
  });

  if (!validId) {
    return (
      <div className="page mt-12 flex flex-col items-start gap-[1.2rem]">
        <h2 className="text-[1.6rem]">Recipe not found!</h2>
        <ButtonLink to="/" variant="quiet">Back to recipes</ButtonLink>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="page mt-12 flex flex-col items-start gap-[1.2rem]">
        <p className="text-[1.05rem] text-ink-soft">
          Sign in to view the recipe.{' '}
          <Link to="/login" className="font-semibold text-cobalt">Sign in</Link>
        </p>
      </div>
    );
  }

  const queryError = [recipeQuery.error, ingredientsQuery.error, stepsQuery.error].find(Boolean);

  const recipe = recipeQuery.data;
  const ingredients = ingredientsQuery.data ?? [];
  const steps = stepsQuery.data ?? [];

  return (
    <div className="page flex flex-col gap-10">
      {recipeQuery.isLoading && (
        <p className="py-8 text-center text-ink-soft">Loading the recipe…</p>
      )}

      {queryError && <ErrorMessage message={errorMessage(queryError)} />}

      {recipe && (
        <>
          <header className="grid grid-cols-[minmax(0,5fr)_minmax(0,6fr)] items-center gap-[2.2rem] max-[760px]:grid-cols-1">
            <img
              className="aspect-4/3 w-full rounded-xl border border-border object-cover shadow-card"
              src={recipe.imageUrl}
              alt={`Photo of ${recipe.title}`}
            />
            <div>
              <h1 className="text-[clamp(2rem,4vw,2.6rem)]">{recipe.title}</h1>
              <p className="mt-2.5 text-ink-soft">{recipe.description}</p>
              <dl className="mt-[1.4rem] flex flex-wrap gap-x-8 gap-y-4">
                <div>
                  <dt className="label text-[0.66rem] font-medium text-ink-soft">Preparation time</dt>
                  <dd className="text-[1.1rem] font-semibold text-cobalt-ink">{recipe.preparationTime} min</dd>
                </div>
                <div>
                  <dt className="label text-[0.66rem] font-medium text-ink-soft">Servings</dt>
                  <dd className="text-[1.1rem] font-semibold text-cobalt-ink">{recipe.servings}</dd>
                </div>
                <div>
                  <dt className="label text-[0.66rem] font-medium text-ink-soft">Difficulty</dt>
                  <dd className="text-[1.1rem] font-semibold text-cobalt-ink">{recipe.difficulty}</dd>
                </div>
              </dl>
              <Link to="/" className="mt-[1.6rem] inline-block text-[0.9rem] font-semibold no-underline hover:underline">
                ← Back to recipes
              </Link>
            </div>
          </header>

          <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-start gap-[1.6rem] max-[900px]:grid-cols-1">
            <section className={sectionClasses} aria-labelledby="ingredients-title">
              <h2 id="ingredients-title" className="mb-[1.1rem] text-[1.35rem]">Ingredients</h2>
              {ingredients.length > 0 ? (
                <ul className="flex list-none flex-col gap-[0.7rem]">
                  {ingredients.map((ingredient) => (
                    <li key={ingredient.id} className="flex items-baseline gap-[0.6rem]">
                      <span>{ingredient.name}</span>
                      <span
                        aria-hidden="true"
                        className="min-w-6 flex-1 -translate-y-1 border-b-2 border-dotted border-border"
                      />
                      <span className="whitespace-nowrap font-mono text-[0.85rem] text-ink-soft">
                        {ingredient.quantity}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[0.92rem] text-ink-soft">No ingredients registered yet.</p>
              )}
              <Button
                variant="quiet"
                compact
                className="mt-[1.2rem]"
                onClick={() => setShowIngredientForm(true)}
              >
                Add ingredient
              </Button>
              <Dialog
                open={showIngredientForm}
                onOpenChange={setShowIngredientForm}
                title="Add ingredient"
                description={recipe.title}
                footer={
                  <Button
                    type="submit"
                    form="form-ingredient"
                    variant="primary"
                    disabled={!ingredientForm.formState.isValid || addIngredientMutation.isPending}
                  >
                    {addIngredientMutation.isPending ? 'Saving…' : 'Save ingredient'}
                  </Button>
                }
              >
                <form
                  id="form-ingredient"
                  onSubmit={ingredientForm.handleSubmit((dto) =>
                    addIngredientMutation.mutate({ ...dto, recipeId }),
                  )}
                  className="flex flex-col gap-[1.1rem]"
                >
                  <TextField
                    label="Name"
                    placeholder="Name"
                    required
                    registration={ingredientForm.register('name')}
                    error={ingredientForm.formState.errors.name?.message}
                  />
                  <TextField
                    label="Quantity"
                    placeholder="Quantity"
                    required
                    registration={ingredientForm.register('quantity')}
                    error={ingredientForm.formState.errors.quantity?.message}
                  />
                </form>
              </Dialog>
            </section>

            <section className={sectionClasses} aria-labelledby="preparation-title">
              <h2 id="preparation-title" className="mb-[1.1rem] text-[1.35rem]">Preparation</h2>
              {steps.length > 0 ? (
                <ol className="flex list-none flex-col gap-[1.1rem]">
                  {steps.map((step) => (
                    <li key={step.id} className="flex gap-4">
                      <span
                        aria-hidden="true"
                        className="grid size-[2.2rem] shrink-0 place-items-center rounded-md border-[1.5px] border-cobalt bg-white font-mono text-[0.95rem] font-medium text-cobalt shadow-[inset_0_0_0_3px_var(--color-white),inset_0_0_0_4px_var(--color-cobalt-mist)]"
                      >
                        {step.stepNumber}
                      </span>
                      <p className="pt-[0.2rem]">{step.description}</p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-[0.92rem] text-ink-soft">No steps registered yet.</p>
              )}
              <Button
                variant="quiet"
                compact
                className="mt-[1.2rem]"
                onClick={() => setShowStepForm(true)}
              >
                Add step
              </Button>
              <Dialog
                open={showStepForm}
                onOpenChange={setShowStepForm}
                title="Add step"
                description={recipe.title}
                footer={
                  <Button
                    type="submit"
                    form="form-step"
                    variant="primary"
                    disabled={!stepForm.formState.isValid || addStepMutation.isPending}
                  >
                    {addStepMutation.isPending ? 'Saving…' : 'Save step'}
                  </Button>
                }
              >
                <form
                  id="form-step"
                  onSubmit={stepForm.handleSubmit((dto) =>
                    addStepMutation.mutate({ ...dto, recipeId }),
                  )}
                  className="flex flex-col gap-[1.1rem]"
                >
                  <TextField
                    label="Number"
                    type="number"
                    placeholder="Number"
                    required
                    registration={stepForm.register('stepNumber', { valueAsNumber: true })}
                    error={stepForm.formState.errors.stepNumber?.message}
                  />
                  <TextField
                    label="Description"
                    placeholder="Description"
                    required
                    registration={stepForm.register('description')}
                    error={stepForm.formState.errors.description?.message}
                  />
                </form>
              </Dialog>
            </section>
          </div>
        </>
      )}
    </div>
  );
}