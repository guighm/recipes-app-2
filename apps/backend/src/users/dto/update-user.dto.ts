import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNotEmpty, Matches, MaxLength } from 'class-validator';
import { EMAIL_MAX_LENGTH, EMAIL_PATTERN, EMAIL_PATTERN_MESSAGE } from '../../common/validators/email.js';

const NAME_MAX_LENGTH = 255;

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Jane Doe', maxLength: NAME_MAX_LENGTH })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(NAME_MAX_LENGTH)
  name?: string;

  @ApiPropertyOptional({ example: 'jane.doe@email.com', maxLength: EMAIL_MAX_LENGTH })
  @IsOptional()
  @IsString()
  @MaxLength(EMAIL_MAX_LENGTH)
  @Matches(EMAIL_PATTERN, { message: EMAIL_PATTERN_MESSAGE })
  email?: string;
}
