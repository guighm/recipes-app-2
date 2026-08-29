import { ApiProperty } from '@nestjs/swagger';

export class RecipeDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  userId!: number;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  preparationTime!: number;

  @ApiProperty()
  servings!: number;

  @ApiProperty()
  difficulty!: string;

  @ApiProperty()
  imageUrl!: string;

  @ApiProperty()
  createdAt!: Date;
}