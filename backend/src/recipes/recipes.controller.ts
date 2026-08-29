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
import { ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { CreateRecipeDto } from './dto/create-recipe.dto.js';
import { RecipesService } from './recipes.service.js';
import type { AuthUser } from '../common/request-with-user.js';

@ApiTags('recipes')
@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Get()
  list() {
    return this.recipesService.list();
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.recipesService.getById(id);
  }

  @Post()
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
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const user = req.user as AuthUser;
    return this.recipesService.delete(id, user);
  }

  @Get(':id/ingredients')
  listIngredients(@Param('id', ParseIntPipe) id: number) {
    return this.recipesService.listIngredients(id);
  }

  @Get(':id/steps')
  listSteps(@Param('id', ParseIntPipe) id: number) {
    return this.recipesService.listSteps(id);
  }
}