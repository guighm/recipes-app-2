import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router';
import { ApiError, apiFetch } from '../lib/api';
import { useIsAuthenticated } from '../stores/auth';
import type { RecipeDTO } from '../models/recipe';
import type { CreateIngredientDTO, IngredientDTO } from '../models/ingredient';
import type { CreateStepDTO, StepDTO } from '../models/step';
import './RecipeDetailPage.css';

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
      <div className="recipe__page">
        <h2>Receita não encontrada!</h2>
        <Link to="/" className="ancora">Voltar para a Home</Link>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="recipe__page">
        <p className="aviso-login">
          Faça login para ver a receita. <Link to="/login" className="aviso-login__link">Fazer Login</Link>
        </p>
      </div>
    );
  }

  const queryError = [recipeQuery.error, ingredientsQuery.error, stepsQuery.error].find(
    (error) => error instanceof ApiError,
  );

  const receita = recipeQuery.data;
  const ingredientes = ingredientsQuery.data;
  const passos = stepsQuery.data;

  return (
    <div className="recipe__page">
      {recipeQuery.isLoading && <p>Carregando…</p>}

      {queryError instanceof ApiError && (
        <p className="erro-api">
          {queryError.status === 401
            ? 'Não autorizado. Faça login novamente.'
            : 'Falha ao carregar a receita.'}
        </p>
      )}

      {receita && (
        <div className="receita">
          <img
            className="receita__imagem"
            src={receita.imageUrl}
            alt={`Imagem de ${receita.title}`}
          />
          <h2 className="receita__titulo">{receita.title}</h2>
          <p><strong>Descrição: </strong>{receita.description}</p>
          <p><strong>Tempo de Preparação: </strong>{receita.preparationTime}</p>
          <p><strong>Número de Porções: </strong>{receita.servings}</p>
          <p><strong>Dificuldade: </strong>{receita.difficulty}</p>
        </div>
      )}

      <div className="lista">
        <h2>Lista de Ingredientes</h2>
        <table className="tabela">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Quantidade</th>
            </tr>
          </thead>
          <tbody>
            {(ingredientes ?? []).map((ingrediente) => (
              <tr key={ingrediente.id}>
                <td>{ingrediente.name}</td>
                <td>{ingrediente.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={() => setShowIngredientForm((visible) => !visible)}>Novo Ingrediente</button>
        {showIngredientForm && (
          <form
            onSubmit={ingredientForm.handleSubmit((dto) =>
              addIngredientMutation.mutate({ ...dto, recipeId }),
            )}
            className="formulario"
          >
            <div className="campo">
              <label htmlFor="nome">Nome</label>
              <input type="text" id="nome" placeholder="Nome" {...ingredientForm.register('name')} />
            </div>
            <div className="campo">
              <label htmlFor="quantity">Quantidade</label>
              <input type="text" id="quantity" placeholder="Quantidade" {...ingredientForm.register('quantity')} />
            </div>
            <button type="submit" disabled={!ingredientForm.formState.isValid || addIngredientMutation.isPending}>
              Cadastrar
            </button>
          </form>
        )}
      </div>

      <div className="lista">
        <h2>Lista de Passos</h2>
        <table className="tabela">
          <thead>
            <tr>
              <th>Número</th>
              <th>Descrição</th>
            </tr>
          </thead>
          <tbody>
            {(passos ?? []).map((passo) => (
              <tr key={passo.id}>
                <td>{passo.stepNumber}</td>
                <td>{passo.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={() => setShowStepForm((visible) => !visible)}>Novo Passo</button>
        {showStepForm && (
          <form
            onSubmit={stepForm.handleSubmit((dto) =>
              addStepMutation.mutate({ ...dto, recipeId }),
            )}
            className="formulario"
          >
            <div className="campo">
              <label htmlFor="number">Número</label>
              <input type="number" id="number" placeholder="Número" {...stepForm.register('stepNumber', { valueAsNumber: true })} />
            </div>
            <div className="campo">
              <label htmlFor="description">Descrição</label>
              <input type="text" id="description" placeholder="Descrição" {...stepForm.register('description')} />
            </div>
            <button type="submit" disabled={!stepForm.formState.isValid || addStepMutation.isPending}>
              Cadastrar
            </button>
          </form>
        )}
      </div>

      {mutationError && <p className="erro-api">{mutationError}</p>}
    </div>
  );
}