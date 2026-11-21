import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

export const DRIZZLE = Symbol('DRIZZLE');

export type Database = ReturnType<typeof createDrizzle>;

export function createDrizzle(config: ConfigService) {
  const client = postgres(config.getOrThrow<string>('DATABASE_URL'));
  return drizzle(client, { schema });
}