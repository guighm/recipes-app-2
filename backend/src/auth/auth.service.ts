import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { DRIZZLE, type Database } from '../database/database.provider.js';
import { users } from '../database/schema.js';
import type { AuthUser } from '../common/request-with-user.js';
import type { JwtDto } from './dto/jwt.dto.js';
import type { LoginDto } from './dto/login.dto.js';
import type { UserDto } from '../users/dto/user.dto.js';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: LoginDto): Promise<JwtDto> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, dto.email));

    if (user === undefined || !(await compare(dto.password, user.password))) {
      throw new UnauthorizedException();
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.email,
      id: user.id,
    });

    return { id: user.id, accessToken };
  }

  async me(user: AuthUser): Promise<UserDto> {
    const [found] = await this.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        avatarUrl: users.avatarUrl,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, user.id));

    if (found === undefined) {
      throw new NotFoundException();
    }

    return found;
  }

  get issuer(): string {
    return this.configService.get<string>('JWT_ISSUER') ?? 'recipes-app-api';
  }
}