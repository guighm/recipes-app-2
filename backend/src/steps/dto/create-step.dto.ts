import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateStepDto {
  @ApiProperty({ example: 1, description: 'Id of the recipe this step belongs to' })
  @IsInt()
  recipeId!: number;

  @ApiProperty({ example: 1, minimum: 1, description: 'Order of the step within the recipe' })
  @IsInt()
  @Min(1)
  stepNumber!: number;

  @ApiProperty({ example: 'Boil the pasta in salted water until al dente.' })
  @IsString()
  @IsNotEmpty()
  description!: string;
}
