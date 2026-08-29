import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { CreateIngredientDto } from './dto/create-ingredient.dto.js';
import { IngredientsService } from './ingredients.service.js';

@ApiTags('ingredients')
@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @Post()
  async create(
    @Body() dto: CreateIngredientDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ingredient = await this.ingredientsService.create(dto);
    res.setHeader('Location', `/ingredients/${ingredient.id}`);
    return ingredient;
  }
}