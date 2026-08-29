import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateIngredientDto {
  @IsInt()
  recipeId!: number;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  quantity!: string;
}