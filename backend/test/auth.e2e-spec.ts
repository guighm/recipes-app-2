import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, resetDb } from './utils/setup-app.js';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    ({ app } = await createTestApp());
    await resetDb(app);
  });

  it('POST /auth/login with the seeded admin returns 200 and a JWT', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@email.com', password: '123' })
      .expect(200);

    expect(response.body.id).toBe(1);
    expect(typeof response.body.accessToken).toBe('string');
  });

  it('POST /auth/login with a wrong password returns 401', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@email.com', password: 'wrong' })
      .expect(401);
  });

  it('POST /auth/login with an unknown email returns 401', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'nobody@email.com', password: '123' })
      .expect(401);
  });

  it('POST /users/register creates a user and sets the Location header', async () => {
    const response = await request(app.getHttpServer())
      .post('/users/register')
      .send({
        name: 'Maria',
        email: 'maria@email.com',
        password: 'secret123',
        avatarUrl: 'maria',
      })
      .expect(201);

    expect(response.body).toEqual({
      id: expect.any(Number),
      name: 'Maria',
      email: 'maria@email.com',
      avatarUrl: 'maria',
      createdAt: expect.any(String),
    });
    expect(response.body.password).toBeUndefined();
    expect(response.headers.location).toBe(`/users/${response.body.id}`);
  });

  it('POST /users/register with a duplicate email returns 409', () => {
    return request(app.getHttpServer())
      .post('/users/register')
      .send({
        name: 'Admin2',
        email: 'admin@email.com',
        password: 'secret123',
        avatarUrl: 'admin2',
      })
      .expect(409);
  });

  it('a registered user can log in', async () => {
    await request(app.getHttpServer())
      .post('/users/register')
      .send({
        name: 'Maria',
        email: 'maria@email.com',
        password: 'secret123',
        avatarUrl: 'maria',
      });

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'maria@email.com', password: 'secret123' })
      .expect(200);

    expect(typeof response.body.accessToken).toBe('string');
  });

  it('POST /users/register with an invalid payload returns 400', () => {
    return request(app.getHttpServer())
      .post('/users/register')
      .send({ name: '', email: 'not-an-email', password: 'a' })
      .expect(400);
  });

  afterEach(async () => {
    await app.close();
  });
});