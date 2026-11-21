import { ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { sql } from 'drizzle-orm';
import { AppModule } from '../../src/app.module.js';
import { DRIZZLE, type Database } from '../../src/database/database.provider.js';
import { SeedService } from '../../src/database/seed.service.js';

export async function createTestApp(): Promise<{
  app: INestApplication;
  db: Database;
}> {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  await app.init();

  const db = app.get<Database>(DRIZZLE);
  return { app, db };
}

export async function resetDb(app: INestApplication): Promise<void> {
  const db = app.get<Database>(DRIZZLE);
  await db.execute(
    sql`TRUNCATE steps, ingredients, recipes, users RESTART IDENTITY CASCADE`,
  );
  // Re-seed the admin user wiped by the truncate
  await app.get(SeedService).seed();
}

export async function login(
  app: INestApplication,
  email: string,
  password: string,
): Promise<string> {
  const { default: request } = await import('supertest');
  const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password });

  return response.body.accessToken as string;
}