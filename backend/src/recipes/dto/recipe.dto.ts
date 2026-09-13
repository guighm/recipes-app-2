import { ApiProperty } from '@nestjs/swagger';

export class RecipeDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 1, description: 'Id of the user who created the recipe' })
  userId!: number;

  @ApiProperty({ example: 'Spaghetti Carbonara' })
  title!: string;

  @ApiProperty({ example: 'A classic Italian pasta dish with eggs, cheese, and pancetta.' })
  description!: string;

  @ApiProperty({ example: 30, description: 'Preparation time in minutes' })
  preparationTime!: number;

  @ApiProperty({ example: 4 })
  servings!: number;

  @ApiProperty({ example: 'Medium' })
  difficulty!: string;

  @ApiProperty({ example: 'https://example.com/images/carbonara.jpg' })
  imageUrl!: string;

  @ApiProperty({ example: '2026-01-15T12:00:00.000Z' })
  createdAt!: Date;
}
