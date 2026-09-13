import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

const DESCRIPTION_MAX_LENGTH = 2000;

export class CreateStepDto {
  @ApiProperty({ example: 1, description: 'Id of the recipe this step belongs to' })
  @IsInt()
  recipeId!: number;

  @ApiProperty({ example: 1, minimum: 1, description: 'Order of the step within the recipe' })
  @IsInt()
  @Min(1)
  stepNumber!: number;

  @ApiProperty({
    example: 'Boil the pasta in salted water until al dente.',
    maxLength: DESCRIPTION_MAX_LENGTH,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(DESCRIPTION_MAX_LENGTH)
  description!: string;
}
