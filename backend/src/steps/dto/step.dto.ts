import { ApiProperty } from '@nestjs/swagger';

export class StepDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 1, description: 'Order of the step within the recipe' })
  stepNumber!: number;

  @ApiProperty({ example: 'Boil the pasta in salted water until al dente.' })
  description!: string;
}
