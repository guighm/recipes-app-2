import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

const TITLE_MAX_LENGTH = 255;
const DESCRIPTION_MAX_LENGTH = 2000;
const DIFFICULTY_MAX_LENGTH = 255;
const IMAGE_URL_MAX_LENGTH = 255;

export class CreateRecipeDto {
  @ApiProperty({ example: 'Spaghetti Carbonara', maxLength: TITLE_MAX_LENGTH })
  @IsString()
  @IsNotEmpty()
  @MaxLength(TITLE_MAX_LENGTH)
  title!: string;

  @ApiProperty({
    example: 'A classic Italian pasta dish with eggs, cheese, and pancetta.',
    maxLength: DESCRIPTION_MAX_LENGTH,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(DESCRIPTION_MAX_LENGTH)
  description!: string;

  @ApiProperty({ example: 30, minimum: 1, description: 'Preparation time in minutes' })
  @IsInt()
  @Min(1)
  preparationTime!: number;

  @ApiProperty({ example: 4, minimum: 1 })
  @IsInt()
  @Min(1)
  servings!: number;

  @ApiProperty({ example: 'Medium', maxLength: DIFFICULTY_MAX_LENGTH })
  @IsString()
  @IsNotEmpty()
  @MaxLength(DIFFICULTY_MAX_LENGTH)
  difficulty!: string;

  @ApiProperty({ example: 'https://example.com/images/carbonara.jpg', maxLength: IMAGE_URL_MAX_LENGTH })
  @IsString()
  @IsNotEmpty()
  @MaxLength(IMAGE_URL_MAX_LENGTH)
  imageUrl!: string;
}
