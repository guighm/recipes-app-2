import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { DRIZZLE, type Database } from '../database/database.provider.js';
import { users } from '../database/schema.js';
import type { UserDto } from './dto/user.dto.js';
import type { CreateUserDto } from './dto/create-user.dto.js';

const BCRYPT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async create(dto: CreateUserDto): Promise<UserDto> {
    const existing = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, dto.email));

    if (existing.length > 0) {
      throw new ConflictException('Email already registered');
    }

    const [user] = await this.db
      .insert(users)
      .values({
        name: dto.name,
        email: dto.email,
        password: await hash(dto.password, BCRYPT_ROUNDS),
        avatarUrl: dto.avatarUrl,
        createdAt: new Date(),
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        avatarUrl: users.avatarUrl,
        createdAt: users.createdAt,
      });

    return user;
  }
}