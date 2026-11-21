export interface StepDTO {
  id: number;
  stepNumber: number;
  description: string;
}

export interface CreateStepDTO {
  recipeId: number;
  stepNumber: number;
  description: string;
}