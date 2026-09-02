import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';
import { ApiError, apiFetch } from '../lib/api';
import { useAuthStore, useIsAuthenticated } from '../stores/auth';
import { Button, ButtonLink } from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';
import type { RecipeDTO } from '../models/recipe';

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
    <div className="pagina flex flex-col gap-10">
      <header className="flex flex-wrap items-end justify-between gap-4 max-[560px]:items-start">
        <div>
          <h1 className="text-[clamp(2rem,4vw,2.8rem)]">Suas receitas</h1>
          <p className="mt-1.5 max-w-[44ch] text-tinta-suave">
            Tudo o que você já cozinhou, guardado num caderno só.
          </p>
        </div>
        <div className="flex gap-3">
          <ButtonLink to="/recipe/new" variant="primario">Nova receita</ButtonLink>
          {isAuthenticated && (
            <Button variant="quieto" onClick={logout}>Sair</Button>
          )}
        </div>
      </header>

      {!isAuthenticated && (
        <div className="mx-auto flex w-full max-w-120 flex-col items-center gap-[0.7rem] rounded-xl border-[1.5px] border-dashed border-borda px-8 py-12 text-center mt-15">
          <h2 className="text-2xl">Este caderno é seu</h2>
          <p className="text-tinta-suave">
            Entre para guardar suas receitas, ingredientes e o modo de preparo
            de cada prato.
          </p>
          <ButtonLink to="/login" variant="primario" className="mt-[0.6rem]">Entrar</ButtonLink>
        </div>
      )}

      {isAuthenticated && isLoading && (
        <p className="py-8 text-center text-tinta-suave">Carregando suas receitas…</p>
      )}

      {isAuthenticated && error instanceof ApiError && (
        <ErrorMessage
          message={
            error.status === 401
              ? 'Não autorizado. Faça login novamente.'
              : 'Falha ao carregar as receitas.'
          }
        />
      )}

      {isAuthenticated && receitas && receitas.length === 0 && (
        <div className="mx-auto flex w-full max-w-120 flex-col items-center gap-[0.7rem] rounded-xl border-[1.5px] border-dashed border-borda px-8 py-12 text-center">
          <h2 className="text-2xl">O caderno está em branco</h2>
          <p className="text-tinta-suave">Cadastre a primeira receita e comece sua coleção.</p>
          <ButtonLink to="/recipe/new" variant="primario" className="mt-[0.6rem]">Nova receita</ButtonLink>
        </div>
      )}

      {isAuthenticated && receitas && receitas.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-[1.4rem]">
          {receitas.map((receita) => (
            <article
              key={receita.id}
              className="group flex flex-col overflow-hidden rounded-xl border border-borda bg-branco shadow-sombra transition-[box-shadow,transform] duration-250 ease-in-out hover:-translate-y-0.75 hover:shadow-sombra-levitada"
            >
              <div className="aspect-16/10 overflow-hidden border-b border-borda bg-cobalto-nevoa">
                <img
                  className="h-full w-full object-cover transition-transform duration-350 ease-in-out group-hover:scale-[1.04]"
                  src={receita.imageUrl}
                  alt={`Foto de ${receita.title}`}
                />
              </div>
              <div className="flex flex-1 flex-col gap-[0.55rem] px-[1.2rem] pt-[1.1rem] pb-[1.3rem]">
                <p className="rotulo self-start rounded-sm border border-cobalto px-2 py-[0.15rem] text-[0.66rem] font-medium text-cobalto">
                  {receita.difficulty}
                </p>
                <h3 className="text-[1.3rem]">
                  <Link to={`/recipe/${receita.id}`} className="text-inherit no-underline hover:text-cobalto hover:underline">
                    {receita.title}
                  </Link>
                </h3>
                <p className="line-clamp-2 flex-1 text-[0.92rem] text-tinta-suave">{receita.description}</p>
                <p className="flex gap-2 font-mono text-[0.7rem] tracking-[0.06em] text-tinta-suave uppercase">
                  <span>{receita.preparationTime} min</span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {receita.servings} {receita.servings === 1 ? 'porção' : 'porções'}
                  </span>
                </p>
                <div className="mt-1.5 flex gap-[0.6rem]">
                  <ButtonLink to={`/recipe/${receita.id}`} variant="quieto" compact className="flex-1">
                    Ver receita
                  </ButtonLink>
                  <Button
                    variant="perigo"
                    compact
                    className="flex-1"
                    onClick={() => handleDelete(receita.id)}
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {deleteError && <ErrorMessage message={deleteError} />}
    </div>
  );
}