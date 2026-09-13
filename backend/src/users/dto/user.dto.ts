import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Jane Doe' })
  name!: string;

  @ApiProperty({ example: 'jane.doe@email.com' })
  email!: string;

  @ApiProperty({ example: 'https://example.com/avatars/jane.png' })
  avatarUrl!: string;

  @ApiProperty({ example: '2026-01-15T12:00:00.000Z' })
  createdAt!: Date;
}
