import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, resetDb } from './utils/setup-app.js';

describe('Recipes (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let mariaToken: string;

  const recipePayload = {
    title: 'Cake',
    description: 'Chocolate cake',
    preparationTime: 30,
    servings: 8,
    difficulty: 'easy',
    imageUrl: 'http://img.com/cake.jpg',
  };

  beforeEach(async () => {
    ({ app } = await createTestApp());
    await resetDb(app);

    const server = app.getHttpServer();

    const loginAdmin = await request(server)
      .post('/auth/login')
      .send({ email: 'admin@email.com', password: '123' });
    adminToken = loginAdmin.body.accessToken;

    await request(server).post('/users/register').send({
      name: 'Maria',
      email: 'maria@email.com',
      password: 'secret123',
      avatarUrl: 'maria',
    });

    const loginMaria = await request(server)
      .post('/auth/login')
      .send({ email: 'maria@email.com', password: 'secret123' });
    mariaToken = loginMaria.body.accessToken;
  });

  it('returns 401 without a token', () => {
    return request(app.getHttpServer()).get('/recipes').expect(401);
  });

  it('returns an empty list with 200 when there are no recipes', () => {
    return request(app.getHttpServer())
      .get('/recipes')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .expect([]);
  });

  it('creates a recipe linked to the JWT user', async () => {
    const response = await request(app.getHttpServer())
      .post('/recipes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(recipePayload)
      .expect(201);

    expect(response.body).toEqual({
      id: expect.any(Number),
      userId: 1,
      ...recipePayload,
      createdAt: expect.any(String),
    });
    expect(response.headers.location).toBe(`/recipes/${response.body.id}`);
  });

  it('lists, fetches by id and returns 404 for a missing recipe', async () => {
    const server = app.getHttpServer();

    const created = await request(server)
      .post('/recipes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(recipePayload);

    await request(server)
      .get('/recipes')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveLength(1);
        expect(res.body[0].id).toBe(created.body.id);
      });

    await request(server)
      .get(`/recipes/${created.body.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    await request(server)
      .get('/recipes/999')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);
  });

  it('lets the owner delete their recipe (204) but blocks others (403)', async () => {
    const server = app.getHttpServer();

    const created = await request(server)
      .post('/recipes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(recipePayload);

    await request(server)
      .delete(`/recipes/${created.body.id}`)
      .set('Authorization', `Bearer ${mariaToken}`)
      .expect(403);

    await request(server)
      .delete(`/recipes/${created.body.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(204);

    await request(server)
      .delete(`/recipes/${created.body.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);
  });

  it('adds ingredients and steps and lists them nested under the recipe', async () => {
    const server = app.getHttpServer();

    const created = await request(server)
      .post('/recipes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(recipePayload);
    const recipeId = created.body.id;

    await request(server)
      .post('/ingredients')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ recipeId, name: 'Flour', quantity: '1kg' })
      .expect(201);

    await request(server)
      .post('/steps')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ recipeId, stepNumber: 1, description: 'Mix everything' })
      .expect(201);

    await request(server)
      .get(`/recipes/${recipeId}/ingredients`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual([
          { id: expect.any(Number), name: 'Flour', quantity: '1kg' },
        ]);
      });

    await request(server)
      .get(`/recipes/${recipeId}/steps`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual([
          {
            id: expect.any(Number),
            stepNumber: 1,
            description: 'Mix everything',
          },
        ]);
      });
  });

  it('returns 404 posting an ingredient or step to a missing recipe', async () => {
    const server = app.getHttpServer();

    await request(server)
      .post('/ingredients')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ recipeId: 999, name: 'X', quantity: '1' })
      .expect(404);

    await request(server)
      .post('/steps')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ recipeId: 999, stepNumber: 1, description: 'X' })
      .expect(404);
  });

  it('returns 400 for an invalid recipe payload and strips extra fields', async () => {
    const server = app.getHttpServer();

    await request(server)
      .post('/recipes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: '' })
      .expect(400);

    const created = await request(server)
      .post('/recipes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...recipePayload, hackerField: 'x' })
      .expect(201);

    expect(created.body.hackerField).toBeUndefined();
  });

  afterEach(async () => {
    await app.close();
  });
});