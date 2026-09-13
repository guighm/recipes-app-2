import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { EMAIL_MAX_LENGTH, EMAIL_PATTERN, EMAIL_PATTERN_MESSAGE } from '../../common/validators/email.js';
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_PATTERN,
  PASSWORD_PATTERN_MESSAGE,
} from '../../common/validators/password.js';

const NAME_MAX_LENGTH = 255;
const AVATAR_URL_MAX_LENGTH = 255;

export class CreateUserDto {
  @ApiProperty({ example: 'Jane Doe', maxLength: NAME_MAX_LENGTH })
  @IsString()
  @IsNotEmpty()
  @MaxLength(NAME_MAX_LENGTH)
  name!: string;

  @ApiProperty({ example: 'jane.doe@email.com', maxLength: EMAIL_MAX_LENGTH })
  @IsString()
  @MaxLength(EMAIL_MAX_LENGTH)
  @Matches(EMAIL_PATTERN, { message: EMAIL_PATTERN_MESSAGE })
  email!: string;

  @ApiProperty({
    example: 'Str0ng!Pass',
    minLength: PASSWORD_MIN_LENGTH,
    maxLength: PASSWORD_MAX_LENGTH,
  })
  @IsString()
  @MinLength(PASSWORD_MIN_LENGTH)
  @MaxLength(PASSWORD_MAX_LENGTH)
  @Matches(PASSWORD_PATTERN, { message: PASSWORD_PATTERN_MESSAGE })
  password!: string;

  @ApiProperty({ example: 'https://example.com/avatars/jane.png', maxLength: AVATAR_URL_MAX_LENGTH })
  @IsString()
  @IsNotEmpty()
  @MaxLength(AVATAR_URL_MAX_LENGTH)
  avatarUrl!: string;
}
