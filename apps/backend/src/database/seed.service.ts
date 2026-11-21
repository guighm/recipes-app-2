import { Inject, Injectable } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { users } from './schema.js';
import { DRIZZLE, type Database } from './database.provider.js';

const ADMIN_EMAIL = 'admin@email.com';

@Injectable()
export class SeedService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async seed(): Promise<void> {
    await this.db
      .insert(users)
      .values({
        name: 'admin',
        email: ADMIN_EMAIL,
        password: await hash('123', 10),
        avatarUrl: 'admin',
        createdAt: new Date(),
      })
      .onConflictDoNothing({ target: users.email });
  }
}