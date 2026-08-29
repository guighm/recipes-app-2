import {
  Global,
  Inject,
  Module,
  type OnApplicationBootstrap,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { createDrizzle, DRIZZLE, type Database } from './database.provider.js';
import { SeedService } from './seed.service.js';

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE,
      inject: [ConfigService],
      useFactory: createDrizzle,
    },
    SeedService,
  ],
  exports: [DRIZZLE],
})
export class DatabaseModule implements OnApplicationBootstrap {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly seedService: SeedService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await migrate(this.db, { migrationsFolder: 'drizzle' });
    await this.seedService.seed();
  }
}