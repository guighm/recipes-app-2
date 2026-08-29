import { ApiProperty } from '@nestjs/swagger';

export class StepDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  stepNumber!: number;

  @ApiProperty()
  description!: string;
}