import { Body, Controller, Post, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { ErrorResponseDto } from '../common/dto/error-response.dto.js';
import { CreateIngredientDto } from './dto/create-ingredient.dto.js';
import { IngredientDto } from './dto/ingredient.dto.js';
import { IngredientsService } from './ingredients.service.js';

@ApiTags('ingredients')
@ApiBearerAuth()
@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @Post()
  @ApiOperation({ summary: 'Add an ingredient to a recipe' })
  @ApiResponse({ status: 201, description: 'Ingredient created', type: IngredientDto })
  @ApiResponse({
    status: 400,
    description: 'Validation failed',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Missing or invalid access token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Recipe not found',
    type: ErrorResponseDto,
  })
  async create(
    @Body() dto: CreateIngredientDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ingredient = await this.ingredientsService.create(dto);
    res.setHeader('Location', `/ingredients/${ingredient.id}`);
    return ingredient;
  }
}
