import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE, type Database } from '../database/database.provider.js';
import { recipes, steps } from '../database/schema.js';
import type { CreateStepDto } from './dto/create-step.dto.js';

@Injectable()
export class StepsService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async create(dto: CreateStepDto) {
    const [recipe] = await this.db
      .select({ id: recipes.id })
      .from(recipes)
      .where(eq(recipes.id, dto.recipeId));

    if (recipe === undefined) {
      throw new NotFoundException('Recipe not found');
    }

    const [step] = await this.db
      .insert(steps)
      .values({
        recipeId: dto.recipeId,
        stepNumber: dto.stepNumber,
        description: dto.description,
      })
      .returning({
        id: steps.id,
        stepNumber: steps.stepNumber,
        description: steps.description,
      });

    return step;
  }
}