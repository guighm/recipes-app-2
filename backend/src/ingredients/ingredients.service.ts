import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE, type Database } from '../database/database.provider.js';
import { ingredients, recipes } from '../database/schema.js';
import type { CreateIngredientDto } from './dto/create-ingredient.dto.js';

@Injectable()
export class IngredientsService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async create(dto: CreateIngredientDto) {
    const [recipe] = await this.db
      .select({ id: recipes.id })
      .from(recipes)
      .where(eq(recipes.id, dto.recipeId));

    if (recipe === undefined) {
      throw new NotFoundException('Recipe not found');
    }

    const [ingredient] = await this.db
      .insert(ingredients)
      .values({
        recipeId: dto.recipeId,
        name: dto.name,
        quantity: dto.quantity,
      })
      .returning({
        id: ingredients.id,
        name: ingredients.name,
        quantity: ingredients.quantity,
      });

    return ingredient;
  }
}