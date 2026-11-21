export interface RecipeDTO {
  id: number;
  userId: number;
  title: string;
  description: string;
  preparationTime: number;
  servings: number;
  difficulty: string;
  imageUrl: string;
  createdAt: string;
}

export interface CreateRecipeDTO {
  title: string;
  description: string;
  preparationTime: number;
  servings: number;
  difficulty: string;
  imageUrl: string;
}