import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';
import { EMAIL_MAX_LENGTH, EMAIL_PATTERN, EMAIL_PATTERN_MESSAGE } from '../../common/validators/email.js';
import { PASSWORD_MAX_LENGTH } from '../../common/validators/password.js';

export class LoginDto {
  @ApiProperty({ example: 'admin@email.com', maxLength: EMAIL_MAX_LENGTH })
  @IsString()
  @MaxLength(EMAIL_MAX_LENGTH)
  @Matches(EMAIL_PATTERN, { message: EMAIL_PATTERN_MESSAGE })
  email!: string;

  @ApiProperty({ example: '123', maxLength: PASSWORD_MAX_LENGTH })
  @IsNotEmpty()
  @MaxLength(PASSWORD_MAX_LENGTH)
  password!: string;
}
