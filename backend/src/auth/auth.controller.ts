import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';
import type { AuthUser } from '../common/request-with-user.js';
import { AuthService } from './auth.service.js';
import { JwtDto } from './dto/jwt.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { UserDto } from '../users/dto/user.dto.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto): Promise<JwtDto> {
    return this.authService.login(dto);
  }

  @Get('me')
  async me(@CurrentUser() user: AuthUser): Promise<UserDto> {
    return this.authService.me(user);
  }
}