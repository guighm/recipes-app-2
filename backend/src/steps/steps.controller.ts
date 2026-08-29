import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { CreateStepDto } from './dto/create-step.dto.js';
import { StepsService } from './steps.service.js';

@ApiTags('steps')
@Controller('steps')
export class StepsController {
  constructor(private readonly stepsService: StepsService) {}

  @Post()
  async create(
    @Body() dto: CreateStepDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const step = await this.stepsService.create(dto);
    res.setHeader('Location', `/steps/${step.id}`);
    return step;
  }
}