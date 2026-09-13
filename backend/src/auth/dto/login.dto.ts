import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@email.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '123' })
  @IsNotEmpty()
  password!: string;
}
