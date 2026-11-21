import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DRIZZLE, type Database } from '../database/database.provider.js';
import { friendships, users } from '../database/schema.js';
import type { AddFriendDto } from '../users/dto/add-friend.dto.js';
import type { FriendDto } from '../users/dto/friend.dto.js';

@Injectable()
export class FriendsService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async add(userId: number, dto: AddFriendDto): Promise<FriendDto> {
    if (dto.friendId === userId) {
      throw new BadRequestException('You cannot add yourself as a friend');
    }

    const [friend] = await this.db
      .select({ id: users.id, name: users.name, avatarUrl: users.avatarUrl })
      .from(users)
      .where(eq(users.id, dto.friendId));

    if (friend === undefined) {
      throw new NotFoundException('User not found');
    }

    const [existing] = await this.db
      .select({ id: friendships.id })
      .from(friendships)
      .where(
        and(
          eq(friendships.userId, userId),
          eq(friendships.friendId, dto.friendId),
        ),
      );

    if (existing !== undefined) {
      throw new ConflictException('Already friends');
    }

    const now = new Date();
    await this.db.transaction(async (tx) => {
      await tx.insert(friendships).values([
        { userId, friendId: dto.friendId, createdAt: now },
        { userId: dto.friendId, friendId: userId, createdAt: now },
      ]);
    });

    return friend;
  }

  async list(userId: number): Promise<FriendDto[]> {
    return this.db
      .select({
        id: users.id,
        name: users.name,
        avatarUrl: users.avatarUrl,
      })
      .from(friendships)
      .innerJoin(users, eq(users.id, friendships.friendId))
      .where(eq(friendships.userId, userId));
  }

  async remove(userId: number, friendId: number): Promise<void> {
    const [existing] = await this.db
      .select({ id: friendships.id })
      .from(friendships)
      .where(
        and(eq(friendships.userId, userId), eq(friendships.friendId, friendId)),
      );

    if (existing === undefined) {
      throw new NotFoundException('Friendship not found');
    }

    await this.db.transaction(async (tx) => {
      await tx
        .delete(friendships)
        .where(
          and(eq(friendships.userId, userId), eq(friendships.friendId, friendId)),
        );
      await tx
        .delete(friendships)
        .where(
          and(eq(friendships.userId, friendId), eq(friendships.friendId, userId)),
        );
    });
  }
}
