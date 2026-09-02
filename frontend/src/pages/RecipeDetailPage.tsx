import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router';
import { ApiError, apiFetch } from '../lib/api';
import { useIsAuthenticated } from '../stores/auth';
import { Button, ButtonLink } from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';
import type { RecipeDTO } from '../models/recipe';
import type { CreateIngredientDTO, IngredientDTO } from '../models/ingredient';
import type { CreateStepDTO, StepDTO } from '../models/step';

interface IngredientFormValues {
  name: string;
  quantity: string;
}

interface StepFormValues {
  stepNumber: number;
  description: string;
}

const ingredientSchema = z.object({
  name: z.string().min(1, 'Campo Obrigatório!'),
  quantity: z.string().min(1, 'Campo Obrigatório!'),
});

const stepSchema = z.object({
  stepNumber: z.number({ message: 'Campo Obrigatório!' }).int('Campo Obrigatório!').min(1, 'Campo Obrigatório!'),
  description: z.string().min(1, 'Campo Obrigatório!'),
});

const campo = 'flex flex-col items-stretch gap-1.5';
const rotuloCampo = 'rotulo text-[0.72rem] font-medium text-tinta-suave';
const secao = 'rounded-xl border border-borda bg-branco px-[1.7rem] pt-[1.6rem] pb-[1.7rem] shadow-sombra';

export default function RecipeDetailPage() {
  const { id } = useParams();
  const recipeId = Number(id);
  const validId = Number.isInteger(recipeId) && recipeId > 0;
  const isAuthenticated = useIsAuthenticated();
  const queryClient = useQueryClient();

  const [showIngredientForm, setShowIngredientForm] = useState(false);
  const [showStepForm, setShowStepForm] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

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

  const onError = (error: unknown) => {
    if (error instanceof ApiError) {
      setMutationError(error.message);
    } else {
      setMutationError('Falha de conexão com o servidor.');
    }
  };

  const addIngredientMutation = useMutation({
    mutationFn: (dto: CreateIngredientDTO) =>
      apiFetch<void>('/ingredients', {
        method: 'POST',
        body: JSON.stringify(dto),
      }),
    onSuccess: () => {
      setMutationError(null);
      queryClient.invalidateQueries({ queryKey: ['ingredients', recipeId] });
      ingredientForm.reset();
      setShowIngredientForm(false);
    },
    onError,
  });

  const addStepMutation = useMutation({
    mutationFn: (dto: CreateStepDTO) =>
      apiFetch<void>('/steps', {
        method: 'POST',
        body: JSON.stringify(dto),
      }),
    onSuccess: () => {
      setMutationError(null);
      queryClient.invalidateQueries({ queryKey: ['steps', recipeId] });
      stepForm.reset();
      setShowStepForm(false);
    },
    onError,
  });

  if (!validId) {
    return (
      <div className="pagina mt-12 flex flex-col items-start gap-[1.2rem]">
        <h2 className="text-[1.6rem]">Receita não encontrada!</h2>
        <ButtonLink to="/" variant="quieto">Voltar para as receitas</ButtonLink>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="pagina mt-12 flex flex-col items-start gap-[1.2rem]">
        <p className="text-[1.05rem] text-tinta-suave">
          Faça login para ver a receita.{' '}
          <Link to="/login" className="font-semibold text-cobalto">Fazer Login</Link>
        </p>
      </div>
    );
  }

  const queryError = [recipeQuery.error, ingredientsQuery.error, stepsQuery.error].find(
    (error) => error instanceof ApiError,
  );

  const receita = recipeQuery.data;
  const ingredientes = ingredientsQuery.data ?? [];
  const passos = stepsQuery.data ?? [];

  return (
    <div className="pagina flex flex-col gap-10">
      {recipeQuery.isLoading && (
        <p className="py-8 text-center text-tinta-suave">Carregando a receita…</p>
      )}

      {queryError instanceof ApiError && (
        <ErrorMessage
          message={
            queryError.status === 401
              ? 'Não autorizado. Faça login novamente.'
              : 'Falha ao carregar a receita.'
          }
        />
      )}

      {receita && (
        <>
          <header className="grid grid-cols-[minmax(0,5fr)_minmax(0,6fr)] items-center gap-[2.2rem] max-[760px]:grid-cols-1">
            <img
              className="aspect-4/3 w-full rounded-xl border border-borda object-cover shadow-sombra"
              src={receita.imageUrl}
              alt={`Foto de ${receita.title}`}
            />
            <div>
              <h1 className="text-[clamp(2rem,4vw,2.6rem)]">{receita.title}</h1>
              <p className="mt-2.5 text-tinta-suave">{receita.description}</p>
              <dl className="mt-[1.4rem] flex flex-wrap gap-x-8 gap-y-4">
                <div>
                  <dt className="rotulo text-[0.66rem] font-medium text-tinta-suave">Tempo de preparo</dt>
                  <dd className="text-[1.1rem] font-semibold text-cobalto-tinta">{receita.preparationTime} min</dd>
                </div>
                <div>
                  <dt className="rotulo text-[0.66rem] font-medium text-tinta-suave">Porções</dt>
                  <dd className="text-[1.1rem] font-semibold text-cobalto-tinta">{receita.servings}</dd>
                </div>
                <div>
                  <dt className="rotulo text-[0.66rem] font-medium text-tinta-suave">Dificuldade</dt>
                  <dd className="text-[1.1rem] font-semibold text-cobalto-tinta">{receita.difficulty}</dd>
                </div>
              </dl>
              <Link to="/" className="mt-[1.6rem] inline-block text-[0.9rem] font-semibold no-underline hover:underline">
                ← Voltar para as receitas
              </Link>
            </div>
          </header>

          <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-start gap-[1.6rem] max-[900px]:grid-cols-1">
            <section className={secao} aria-labelledby="ingredientes-titulo">
              <h2 id="ingredientes-titulo" className="mb-[1.1rem] text-[1.35rem]">Ingredientes</h2>
              {ingredientes.length > 0 ? (
                <ul className="flex list-none flex-col gap-[0.7rem]">
                  {ingredientes.map((ingrediente) => (
                    <li key={ingrediente.id} className="flex items-baseline gap-[0.6rem]">
                      <span>{ingrediente.name}</span>
                      <span
                        aria-hidden="true"
                        className="min-w-6 flex-1 -translate-y-1 border-b-2 border-dotted border-borda"
                      />
                      <span className="whitespace-nowrap font-mono text-[0.85rem] text-tinta-suave">
                        {ingrediente.quantity}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[0.92rem] text-tinta-suave">Nenhum ingrediente cadastrado ainda.</p>
              )}
              <Button
                variant="quieto"
                compact
                className="mt-[1.2rem]"
                onClick={() => setShowIngredientForm((visible) => !visible)}
              >
                {showIngredientForm ? 'Fechar' : 'Adicionar ingrediente'}
              </Button>
              {showIngredientForm && (
                <form
                  onSubmit={ingredientForm.handleSubmit((dto) =>
                    addIngredientMutation.mutate({ ...dto, recipeId }),
                  )}
                  className="mt-4 flex flex-col gap-[1.1rem] border-t border-dashed border-borda pt-[1.2rem]"
                >
                  <div className={campo}>
                    <label htmlFor="nome" className={rotuloCampo}>Nome</label>
                    <input type="text" id="nome" placeholder="Nome" {...ingredientForm.register('name')} />
                    <ErrorMessage message={ingredientForm.formState.errors.name?.message} />
                  </div>
                  <div className={campo}>
                    <label htmlFor="quantity" className={rotuloCampo}>Quantidade</label>
                    <input type="text" id="quantity" placeholder="Quantidade" {...ingredientForm.register('quantity')} />
                    <ErrorMessage message={ingredientForm.formState.errors.quantity?.message} />
                  </div>
                  <Button
                    type="submit"
                    variant="primario"
                    disabled={!ingredientForm.formState.isValid || addIngredientMutation.isPending}
                  >
                    {addIngredientMutation.isPending ? 'Salvando…' : 'Salvar ingrediente'}
                  </Button>
                </form>
              )}
            </section>

            <section className={secao} aria-labelledby="preparo-titulo">
              <h2 id="preparo-titulo" className="mb-[1.1rem] text-[1.35rem]">Modo de preparo</h2>
              {passos.length > 0 ? (
                <ol className="flex list-none flex-col gap-[1.1rem]">
                  {passos.map((passo) => (
                    <li key={passo.id} className="flex gap-4">
                      <span
                        aria-hidden="true"
                        className="grid size-[2.2rem] shrink-0 place-items-center rounded-md border-[1.5px] border-cobalto bg-branco font-mono text-[0.95rem] font-medium text-cobalto shadow-[inset_0_0_0_3px_var(--color-branco),inset_0_0_0_4px_var(--color-cobalto-nevoa)]"
                      >
                        {passo.stepNumber}
                      </span>
                      <p className="pt-[0.2rem]">{passo.description}</p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-[0.92rem] text-tinta-suave">Nenhum passo cadastrado ainda.</p>
              )}
              <Button
                variant="quieto"
                compact
                className="mt-[1.2rem]"
                onClick={() => setShowStepForm((visible) => !visible)}
              >
                {showStepForm ? 'Fechar' : 'Adicionar passo'}
              </Button>
              {showStepForm && (
                <form
                  onSubmit={stepForm.handleSubmit((dto) =>
                    addStepMutation.mutate({ ...dto, recipeId }),
                  )}
                  className="mt-4 flex flex-col gap-[1.1rem] border-t border-dashed border-borda pt-[1.2rem]"
                >
                  <div className={campo}>
                    <label htmlFor="number" className={rotuloCampo}>Número</label>
                    <input
                      type="number"
                      id="number"
                      placeholder="Número"
                      {...stepForm.register('stepNumber', { valueAsNumber: true })}
                    />
                    <ErrorMessage message={stepForm.formState.errors.stepNumber?.message} />
                  </div>
                  <div className={campo}>
                    <label htmlFor="description" className={rotuloCampo}>Descrição</label>
                    <input
                      type="text"
                      id="description"
                      placeholder="Descrição"
                      {...stepForm.register('description')}
                    />
                    <ErrorMessage message={stepForm.formState.errors.description?.message} />
                  </div>
                  <Button
                    type="submit"
                    variant="primario"
                    disabled={!stepForm.formState.isValid || addStepMutation.isPending}
                  >
                    {addStepMutation.isPending ? 'Salvando…' : 'Salvar passo'}
                  </Button>
                </form>
              )}
            </section>
          </div>
        </>
      )}

      {mutationError && <ErrorMessage message={mutationError} />}
    </div>
  );
}