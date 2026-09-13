import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateIngredientDto {
  @ApiProperty({ example: 1, description: 'Id of the recipe this ingredient belongs to' })
  @IsInt()
  recipeId!: number;

  @ApiProperty({ example: 'Spaghetti' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: '200g' })
  @IsString()
  @IsNotEmpty()
  quantity!: string;
}
