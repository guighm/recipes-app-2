import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';

const NAME_MAX_LENGTH = 255;
const QUANTITY_MAX_LENGTH = 255;

export class CreateIngredientDto {
  @ApiProperty({ example: 1, description: 'Id of the recipe this ingredient belongs to' })
  @IsInt()
  recipeId!: number;

  @ApiProperty({ example: 'Spaghetti', maxLength: NAME_MAX_LENGTH })
  @IsString()
  @IsNotEmpty()
  @MaxLength(NAME_MAX_LENGTH)
  name!: string;

  @ApiProperty({ example: '200g', maxLength: QUANTITY_MAX_LENGTH })
  @IsString()
  @IsNotEmpty()
  @MaxLength(QUANTITY_MAX_LENGTH)
  quantity!: string;
}
