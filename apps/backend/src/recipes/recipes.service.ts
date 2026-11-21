import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import { DRIZZLE, type Database } from '../database/database.provider.js';
import { ingredients, recipes, steps } from '../database/schema.js';
import type { AuthUser } from '../common/request-with-user.js';
import type { CreateRecipeDto } from './dto/create-recipe.dto.js';

const RECIPE_COLUMNS = {
  id: recipes.id,
  userId: recipes.userId,
  title: recipes.title,
  description: recipes.description,
  preparationTime: recipes.preparationTime,
  servings: recipes.servings,
  difficulty: recipes.difficulty,
  imageUrl: recipes.imageUrl,
  createdAt: recipes.createdAt,
} as const;

@Injectable()
export class RecipesService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async list() {
    return this.db.select(RECIPE_COLUMNS).from(recipes).orderBy(asc(recipes.id));
  }

  async getById(id: number) {
    const [recipe] = await this.db
      .select(RECIPE_COLUMNS)
      .from(recipes)
      .where(eq(recipes.id, id));

    if (recipe === undefined) {
      throw new NotFoundException('Recipe not found');
    }

    return recipe;
  }

  async create(dto: CreateRecipeDto, user: AuthUser) {
    const [recipe] = await this.db
      .insert(recipes)
      .values({
        userId: user.id,
        title: dto.title,
        description: dto.description,
        preparationTime: dto.preparationTime,
        servings: dto.servings,
        difficulty: dto.difficulty,
        imageUrl: dto.imageUrl,
        createdAt: new Date(),
      })
      .returning(RECIPE_COLUMNS);

    return recipe;
  }

  async delete(id: number, user: AuthUser): Promise<void> {
    const [recipe] = await this.db
      .select({ id: recipes.id, userId: recipes.userId })
      .from(recipes)
      .where(eq(recipes.id, id));

    if (recipe === undefined) {
      throw new NotFoundException('Recipe not found');
    }

    if (recipe.userId !== user.id) {
      throw new ForbiddenException('You do not own this recipe');
    }

    await this.db.delete(recipes).where(eq(recipes.id, id));
  }

  async listIngredients(recipeId: number) {
    await this.assertRecipeExists(recipeId);

    return this.db
      .select({
        id: ingredients.id,
        name: ingredients.name,
        quantity: ingredients.quantity,
      })
      .from(ingredients)
      .where(eq(ingredients.recipeId, recipeId))
      .orderBy(asc(ingredients.id));
  }

  async listSteps(recipeId: number) {
    await this.assertRecipeExists(recipeId);

    return this.db
      .select({
        id: steps.id,
        stepNumber: steps.stepNumber,
        description: steps.description,
      })
      .from(steps)
      .where(eq(steps.recipeId, recipeId))
      .orderBy(asc(steps.id));
  }

  private async assertRecipeExists(recipeId: number): Promise<void> {
    const [recipe] = await this.db
      .select({ id: recipes.id })
      .from(recipes)
      .where(eq(recipes.id, recipeId));

    if (recipe === undefined) {
      throw new NotFoundException('Recipe not found');
    }
  }
}