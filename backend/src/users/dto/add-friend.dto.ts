import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class AddFriendDto {
  @ApiProperty({ example: 2, description: 'Id of the user to add as a friend' })
  @IsInt()
  friendId!: number;
}
