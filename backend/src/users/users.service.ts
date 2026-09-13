import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { compare, hash } from 'bcryptjs';
import { and, eq, ne } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { DRIZZLE, type Database } from '../database/database.provider.js';
import { passwordHistory, users } from '../database/schema.js';
import type { UserDto } from './dto/user.dto.js';
import type { CreateUserDto } from './dto/create-user.dto.js';
import type { UpdateUserDto } from './dto/update-user.dto.js';
import type { ChangePasswordDto } from './dto/change-password.dto.js';

const BCRYPT_ROUNDS = 10;
const AVATARS_DIR = join(process.cwd(), 'uploads', 'avatars');
const AVATARS_URL_PREFIX = '/uploads/avatars/';

const AVATAR_EXTENSIONS_BY_MIME_TYPE: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

const USER_COLUMNS = {
  id: users.id,
  name: users.name,
  email: users.email,
  avatarUrl: users.avatarUrl,
  createdAt: users.createdAt,
} as const;

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
      .returning(USER_COLUMNS);

    return user;
  }

  async update(userId: number, dto: UpdateUserDto): Promise<UserDto> {
    const [current] = await this.db
      .select(USER_COLUMNS)
      .from(users)
      .where(eq(users.id, userId));

    if (current === undefined) {
      throw new NotFoundException('User not found');
    }

    const changes: Partial<UpdateUserDto> = {};
    if (dto.name !== undefined && dto.name !== current.name) {
      changes.name = dto.name;
    }
    if (dto.email !== undefined && dto.email !== current.email) {
      changes.email = dto.email;
    }

    if (Object.keys(changes).length === 0) {
      return current;
    }

    if (changes.email !== undefined) {
      const existing = await this.db
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.email, changes.email), ne(users.id, userId)));

      if (existing.length > 0) {
        throw new ConflictException('Email already registered');
      }
    }

    const [user] = await this.db
      .update(users)
      .set(changes)
      .where(eq(users.id, userId))
      .returning(USER_COLUMNS);

    return user;
  }

  async changePassword(userId: number, dto: ChangePasswordDto): Promise<void> {
    const [user] = await this.db
      .select({ id: users.id, password: users.password })
      .from(users)
      .where(eq(users.id, userId));

    if (user === undefined) {
      throw new NotFoundException('User not found');
    }

    if (!(await compare(dto.currentPassword, user.password))) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    if (await this.wasPasswordUsedBefore(userId, dto.newPassword, user.password)) {
      throw new ConflictException(
        'New password must be different from a previously used password',
      );
    }

    await this.db.transaction(async (tx) => {
      await tx.insert(passwordHistory).values({
        userId,
        password: user.password,
        createdAt: new Date(),
      });
      await tx
        .update(users)
        .set({ password: await hash(dto.newPassword, BCRYPT_ROUNDS) })
        .where(eq(users.id, userId));
    });
  }

  private async wasPasswordUsedBefore(
    userId: number,
    candidate: string,
    currentPasswordHash: string,
  ): Promise<boolean> {
    if (await compare(candidate, currentPasswordHash)) {
      return true;
    }

    const history = await this.db
      .select({ password: passwordHistory.password })
      .from(passwordHistory)
      .where(eq(passwordHistory.userId, userId));

    for (const entry of history) {
      if (await compare(candidate, entry.password)) {
        return true;
      }
    }

    return false;
  }

  async updateAvatar(userId: number, file: Express.Multer.File): Promise<UserDto> {
    const [existing] = await this.db
      .select({ avatarUrl: users.avatarUrl })
      .from(users)
      .where(eq(users.id, userId));

    if (existing === undefined) {
      throw new NotFoundException('User not found');
    }

    const extension = AVATAR_EXTENSIONS_BY_MIME_TYPE[file.mimetype];
    if (extension === undefined) {
      throw new BadRequestException('Unsupported image type');
    }

    await mkdir(AVATARS_DIR, { recursive: true });
    const filename = `${randomUUID()}${extension}`;
    await writeFile(join(AVATARS_DIR, filename), file.buffer);

    const [user] = await this.db
      .update(users)
      .set({ avatarUrl: `${AVATARS_URL_PREFIX}${filename}` })
      .where(eq(users.id, userId))
      .returning(USER_COLUMNS);

    await this.deleteLocalAvatarFile(existing.avatarUrl);

    return user;
  }

  async delete(userId: number): Promise<void> {
    const [user] = await this.db
      .select({ avatarUrl: users.avatarUrl })
      .from(users)
      .where(eq(users.id, userId));

    if (user === undefined) {
      throw new NotFoundException('User not found');
    }

    await this.db.delete(users).where(eq(users.id, userId));
    await this.deleteLocalAvatarFile(user.avatarUrl);
  }

  private async deleteLocalAvatarFile(avatarUrl: string): Promise<void> {
    if (!avatarUrl.startsWith(AVATARS_URL_PREFIX)) {
      return;
    }

    const filename = avatarUrl.slice(AVATARS_URL_PREFIX.length);
    await unlink(join(AVATARS_DIR, filename)).catch(() => undefined);
  }
}
