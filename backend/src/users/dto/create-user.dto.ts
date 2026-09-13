import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'jane.doe@email.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'strongPassword123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ example: 'https://example.com/avatars/jane.png' })
  @IsString()
  @IsNotEmpty()
  avatarUrl!: string;
}
