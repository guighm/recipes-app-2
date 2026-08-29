import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';
import { ApiError, apiFetch } from '../lib/api';
import { useAuthStore, useIsAuthenticated } from '../stores/auth';
import type { RecipeDTO } from '../models/recipe';
import Tooltip from '../components/Tooltip';
import Action from '../components/Action';
import './HomePage.css';

export default function HomePage() {
  const isAuthenticated = useIsAuthenticated();
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();

  const { data: receitas, isLoading, error } = useQuery({
    queryKey: ['recipes'],
    queryFn: () => apiFetch<RecipeDTO[]>('/recipes'),
    enabled: isAuthenticated,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      apiFetch<void>(`/recipes/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });

  const handleDelete = (id: number) => {
    if (!confirm('Gostaria de deletar esta receita?')) {
      return;
    }
    deleteMutation.mutate(id);
  };

  const deleteError = (() => {
    if (!(deleteMutation.error instanceof ApiError)) {
      return null;
    }
    if (deleteMutation.error.status === 403) {
      return 'Você não pode deletar receitas de outro usuário.';
    }
    if (deleteMutation.error.status === 401) {
      return 'Não autorizado. Faça login novamente.';
    }
    return deleteMutation.error.message;
  })();

  return (
    <div className="home">
      <h1>🍴 Aplicativo de Receitas 🍴</h1>
      <h2>Lista de Receitas</h2>

      {!isAuthenticated && (
        <p className="aviso-login">
          Faça login para ver as receitas. <Link to="/login" className="aviso-login__link">Fazer Login</Link>
        </p>
      )}

      {isAuthenticated && isLoading && <p>Carregando…</p>}

      {isAuthenticated && error instanceof ApiError && (
        <p className="erro-api">
          {error.status === 401
            ? 'Não autorizado. Faça login novamente.'
            : 'Falha ao carregar as receitas.'}
        </p>
      )}

      {isAuthenticated && receitas && (
        <table className="tabela">
          <thead>
            <tr>
              <th>Nome da receita</th>
              <th>Descrição</th>
              <th>Tempo de Preparação</th>
              <th>Número de porções</th>
              <th>Dificuldade</th>
              <th>Imagem</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {receitas.map((receita) => (
              <tr key={receita.id}>
                <td className="receita__titulo">{receita.title}</td>
                <td>{receita.description}</td>
                <td>{receita.preparationTime}</td>
                <td>{receita.servings}</td>
                <td className="receita__dificuldade">{receita.difficulty}</td>
                <td>
                  <img
                    className="receita__imagem"
                    src={receita.imageUrl}
                    alt={`Imagem de ${receita.title}`}
                  />
                </td>
                <td>
                  <div className="icones">
                    <Tooltip label="🔍" link={`/recipe/${receita.id}`} message="Ver receita" />
                    <Action label="🗑️" message="Deletar receita" onClick={() => handleDelete(receita.id)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {deleteError && <p className="erro-api">{deleteError}</p>}

      <div className="botoes">
        <Link to="/recipe/new" className="botao__criar__receita">Criar receita</Link>
        {isAuthenticated && (
          <button onClick={logout} className="botao__criar__receita">Logout</button>
        )}
      </div>
    </div>
  );
}