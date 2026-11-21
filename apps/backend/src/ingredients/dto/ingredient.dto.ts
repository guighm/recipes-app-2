import { ApiProperty } from '@nestjs/swagger';

export class IngredientDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Spaghetti' })
  name!: string;

  @ApiProperty({ example: '200g' })
  quantity!: string;
}
