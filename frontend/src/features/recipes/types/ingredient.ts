export interface IngredientDTO {
  id: number;
  name: string;
  quantity: string;
}

export interface CreateIngredientDTO {
  recipeId: number;
  name: string;
  quantity: string;
}