
import ErrorMessage from "@/core/components/ErrorMessage";
import { ConfirmDialog } from "@/core/components/ui/AlertDialog";
import { Button, ButtonLink } from "@/core/components/ui/Button";
import { useToast } from "@/core/components/ui/useToast";
import { apiFetch, errorMessage } from "@/core/config/api";
import { useAuthStore, useIsAuthenticated } from "@/features/auth/stores/auth";
import type { RecipeDTO } from "@/features/recipes/types/recipe";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router";

export default function HomePage() {
  const isAuthenticated = useIsAuthenticated();
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();
  const toast = useToast();
  const [recipeIdToDelete, setRecipeIdToDelete] = useState<number | null>(null);

  const { data: recipes, isLoading, error } = useQuery({
    queryKey: ['recipes'],
    queryFn: () => apiFetch<RecipeDTO[]>('/recipes'),
    enabled: isAuthenticated,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      apiFetch<void>(`/recipes/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      setRecipeIdToDelete(null);
      toast.success({ title: 'Recipe deleted', description: 'The notebook has been updated.' });
    },
    onError: (error) => {
      toast.error({ title: 'Failed to delete', description: errorMessage(error) });
    },
  });

  const confirmDelete = () => {
    if (recipeIdToDelete !== null) {
      deleteMutation.mutate(recipeIdToDelete);
    }
  };

  return (
    <div className="page flex flex-col gap-10">
      <header className="flex flex-wrap items-end justify-between gap-4 max-[560px]:items-start">
        <div>
          <h1 className="text-[clamp(2rem,4vw,2.8rem)]">Your recipes</h1>
          <p className="mt-1.5 max-w-[44ch] text-ink-soft">
            Everything you have ever cooked, kept in a single notebook.
          </p>
        </div>
        <div className="flex gap-3">
          <ButtonLink to="/recipe/new" variant="primary">New recipe</ButtonLink>
          {isAuthenticated && (
            <Button variant="quiet" onClick={logout}>Log out</Button>
          )}
        </div>
      </header>

      {!isAuthenticated && (
        <div className="mx-auto flex w-full max-w-120 flex-col items-center gap-[0.7rem] rounded-xl border-[1.5px] border-dashed border-border px-8 py-12 text-center mt-15">
          <h2 className="text-2xl">This notebook is yours</h2>
          <p className="text-ink-soft">
            Sign in to keep your recipes, ingredients, and the preparation
            steps of each dish.
          </p>
          <ButtonLink to="/login" variant="primary" className="mt-[0.6rem]">Sign in</ButtonLink>
        </div>
      )}

      {isAuthenticated && isLoading && (
        <p className="py-8 text-center text-ink-soft">Loading your recipes…</p>
      )}

      {isAuthenticated && error && (
        <ErrorMessage message={errorMessage(error)} />
      )}

      {isAuthenticated && recipes && recipes.length === 0 && (
        <div className="mx-auto flex w-full max-w-120 flex-col items-center gap-[0.7rem] rounded-xl border-[1.5px] border-dashed border-border px-8 py-12 text-center">
          <h2 className="text-2xl">The notebook is empty</h2>
          <p className="text-ink-soft">Add the first recipe and start your collection.</p>
          <ButtonLink to="/recipe/new" variant="primary" className="mt-[0.6rem]">New recipe</ButtonLink>
        </div>
      )}

      {isAuthenticated && recipes && recipes.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-[1.4rem]">
          {recipes.map((recipe) => (
            <article
              key={recipe.id}
              className="group flex flex-col overflow-hidden rounded-xl border border-border bg-white shadow-card transition-[box-shadow,transform] duration-250 ease-in-out hover:-translate-y-0.75 hover:shadow-card-lifted"
            >
              <div className="aspect-16/10 overflow-hidden border-b border-border bg-cobalt-mist">
                <img
                  className="h-full w-full object-cover transition-transform duration-350 ease-in-out group-hover:scale-[1.04]"
                  src={recipe.imageUrl}
                  alt={`Photo of ${recipe.title}`}
                />
              </div>
              <div className="flex flex-1 flex-col gap-[0.55rem] px-[1.2rem] pt-[1.1rem] pb-[1.3rem]">
                <p className="label self-start rounded-sm border border-cobalt px-2 py-[0.15rem] text-[0.66rem] font-medium text-cobalt">
                  {recipe.difficulty}
                </p>
                <h3 className="text-[1.3rem]">
                  <Link to={`/recipe/${recipe.id}`} className="text-inherit no-underline hover:text-cobalt hover:underline">
                    {recipe.title}
                  </Link>
                </h3>
                <p className="line-clamp-2 flex-1 text-[0.92rem] text-ink-soft">{recipe.description}</p>
                <p className="flex gap-2 font-mono text-[0.7rem] tracking-[0.06em] text-ink-soft uppercase">
                  <span>{recipe.preparationTime} min</span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {recipe.servings} {recipe.servings === 1 ? 'serving' : 'servings'}
                  </span>
                </p>
                <div className="mt-1.5 flex gap-[0.6rem]">
                  <ButtonLink to={`/recipe/${recipe.id}`} variant="quiet" compact className="flex-1">
                    View recipe
                  </ButtonLink>
                  <Button
                    variant="danger"
                    compact
                    className="flex-1"
                    onClick={() => setRecipeIdToDelete(recipe.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={recipeIdToDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setRecipeIdToDelete(null);
          }
        }}
        title="Delete recipe"
        description="This action is permanent: the recipe leaves the notebook forever."
        confirmLabel="Delete"
        destructive
        pending={deleteMutation.isPending}
        pendingLabel="Deleting…"
        onConfirm={confirmDelete}
      />
    </div>
  );
}