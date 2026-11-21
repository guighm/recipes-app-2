import { ApiProperty } from '@nestjs/swagger';

export class FriendDto {
  @ApiProperty({ example: 2 })
  id!: number;

  @ApiProperty({ example: 'Jane Doe' })
  name!: string;

  @ApiProperty({ example: '/uploads/avatars/abc123.png' })
  avatarUrl!: string;
}
