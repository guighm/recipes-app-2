import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
} from 'class-validator';

export class CreateRecipeDto {
  @ApiProperty({ example: 'Spaghetti Carbonara' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'A classic Italian pasta dish with eggs, cheese, and pancetta.' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ example: 30, minimum: 1, description: 'Preparation time in minutes' })
  @IsInt()
  @Min(1)
  preparationTime!: number;

  @ApiProperty({ example: 4, minimum: 1 })
  @IsInt()
  @Min(1)
  servings!: number;

  @ApiProperty({ example: 'Medium' })
  @IsString()
  @IsNotEmpty()
  difficulty!: string;

  @ApiProperty({ example: 'https://example.com/images/carbonara.jpg' })
  @IsString()
  @IsNotEmpty()
  imageUrl!: string;
}
