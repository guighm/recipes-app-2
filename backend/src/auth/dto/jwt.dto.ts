import { ApiProperty } from '@nestjs/swagger';

export class JwtDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken!: string;
}
