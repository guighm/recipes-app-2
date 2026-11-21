import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Patch,
  ParseFilePipeBuilder,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { memoryStorage } from 'multer';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';
import { ErrorResponseDto } from '../common/dto/error-response.dto.js';
import type { AuthUser } from '../common/request-with-user.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UserDto } from './dto/user.dto.js';
import { UsersService } from './users.service.js';

const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User created', type: UserDto })
  @ApiResponse({
    status: 400,
    description: 'Validation failed',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'E-mail already registered',
    type: ErrorResponseDto,
  })
  async register(
    @Body() dto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.usersService.create(dto);
    res.setHeader('Location', `/users/${user.id}`);
    return user;
  }

  @Patch('me')
  @ApiOperation({ summary: "Update the current user's name and/or e-mail" })
  @ApiResponse({ status: 200, description: 'User updated', type: UserDto })
  @ApiResponse({
    status: 400,
    description: 'Validation failed',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Missing or invalid access token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'E-mail already registered by another user',
    type: ErrorResponseDto,
  })
  async update(@Body() dto: UpdateUserDto, @CurrentUser() user: AuthUser) {
    return this.usersService.update(user.id, dto);
  }

  @Patch('me/password')
  @HttpCode(204)
  @ApiOperation({ summary: "Change the current user's password" })
  @ApiResponse({ status: 204, description: 'Password changed' })
  @ApiResponse({
    status: 400,
    description: 'Validation failed',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Missing/invalid access token, or current password is incorrect',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'New password matches the current or a previously used password',
    type: ErrorResponseDto,
  })
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @CurrentUser() user: AuthUser,
  ) {
    await this.usersService.changePassword(user.id, dto);
  }

  @Post('me/avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_AVATAR_SIZE_BYTES },
    }),
  )
  @ApiOperation({ summary: "Upload the current user's profile picture" })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiResponse({ status: 201, description: 'Avatar updated', type: UserDto })
  @ApiResponse({
    status: 400,
    description: 'File is not a supported image type',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Missing or invalid access token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 413,
    description: 'File is larger than 5MB',
    type: ErrorResponseDto,
  })
  async uploadAvatar(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /^image\/(jpeg|png|webp|gif)$/,
          overrideMimeType: true,
        })
        .build({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    file: Express.Multer.File,
    @CurrentUser() user: AuthUser,
  ) {
    return this.usersService.updateAvatar(user.id, file);
  }

  @Delete('me')
  @HttpCode(204)
  @ApiOperation({ summary: "Permanently delete the current user's account" })
  @ApiResponse({ status: 204, description: 'Account deleted' })
  @ApiResponse({
    status: 401,
    description: 'Missing or invalid access token',
    type: ErrorResponseDto,
  })
  async remove(@CurrentUser() user: AuthUser) {
    await this.usersService.delete(user.id);
  }
}
