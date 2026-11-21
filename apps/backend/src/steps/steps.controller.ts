import { Body, Controller, Post, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { ErrorResponseDto } from '../common/dto/error-response.dto.js';
import { CreateStepDto } from './dto/create-step.dto.js';
import { StepDto } from './dto/step.dto.js';
import { StepsService } from './steps.service.js';

@ApiTags('steps')
@ApiBearerAuth()
@Controller('steps')
export class StepsController {
  constructor(private readonly stepsService: StepsService) {}

  @Post()
  @ApiOperation({ summary: 'Add a step to a recipe' })
  @ApiResponse({ status: 201, description: 'Step created', type: StepDto })
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
    @Body() dto: CreateStepDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const step = await this.stepsService.create(dto);
    res.setHeader('Location', `/steps/${step.id}`);
    return step;
  }
}
