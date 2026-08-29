import { ApiProperty } from '@nestjs/swagger';

export class IngredientDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  quantity!: string;
}