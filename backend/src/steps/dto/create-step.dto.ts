import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateStepDto {
  @IsInt()
  recipeId!: number;

  @IsInt()
  @Min(1)
  stepNumber!: number;

  @IsString()
  @IsNotEmpty()
  description!: string;
}