import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { ErrorResponseDto } from '../common/dto/error-response.dto.js';
import { CreateRecipeDto } from './dto/create-recipe.dto.js';
import { RecipeDto } from './dto/recipe.dto.js';
import { RecipesService } from './recipes.service.js';
import type { AuthUser } from '../common/request-with-user.js';
import { IngredientDto } from '../ingredients/dto/ingredient.dto.js';
import { StepDto } from '../steps/dto/step.dto.js';

@ApiTags('recipes')
@ApiBearerAuth()
@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Get()
  @ApiOperation({ summary: 'List all recipes' })
  @ApiResponse({ status: 200, description: 'List of recipes', type: [RecipeDto] })
  @ApiResponse({
    status: 401,
    description: 'Missing or invalid access token',
    type: ErrorResponseDto,
  })
  list() {
    return this.recipesService.list();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a recipe by id' })
  @ApiResponse({ status: 200, description: 'The recipe', type: RecipeDto })
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
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.recipesService.getById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a recipe owned by the current user' })
  @ApiResponse({ status: 201, description: 'Recipe created', type: RecipeDto })
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
  async create(
    @Body() dto: CreateRecipeDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user as AuthUser;
    const recipe = await this.recipesService.create(dto, user);
    res.setHeader('Location', `/recipes/${recipe.id}`);
    return recipe;
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a recipe owned by the current user' })
  @ApiResponse({ status: 204, description: 'Recipe deleted' })
  @ApiResponse({
    status: 401,
    description: 'Missing or invalid access token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'The recipe belongs to another user',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Recipe not found',
    type: ErrorResponseDto,
  })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const user = req.user as AuthUser;
    return this.recipesService.delete(id, user);
  }

  @Get(':id/ingredients')
  @ApiOperation({ summary: 'List the ingredients of a recipe' })
  @ApiResponse({ status: 200, description: 'List of ingredients', type: [IngredientDto] })
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
  listIngredients(@Param('id', ParseIntPipe) id: number) {
    return this.recipesService.listIngredients(id);
  }

  @Get(':id/steps')
  @ApiOperation({ summary: 'List the steps of a recipe' })
  @ApiResponse({ status: 200, description: 'List of steps', type: [StepDto] })
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
  listSteps(@Param('id', ParseIntPipe) id: number) {
    return this.recipesService.listSteps(id);
  }
}
