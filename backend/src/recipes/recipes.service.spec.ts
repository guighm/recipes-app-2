import type { Database } from '../database/database.provider.js';
import type { AuthUser } from '../common/request-with-user.js';
import { RecipesService } from './recipes.service.js';
import type { CreateRecipeDto } from './dto/create-recipe.dto.js';

describe('RecipesService', () => {
  let service: RecipesService;
  let db: {
    select: ReturnType<typeof vi.fn>;
    insert: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  const dto: CreateRecipeDto = {
    title: 'Cake',
    description: 'Chocolate cake',
    preparationTime: 30,
    servings: 8,
    difficulty: 'easy',
    imageUrl: 'http://img.com/cake.jpg',
  };

  const user: AuthUser = { id: 1, email: 'admin@email.com' };

  const recipeRow = {
    id: 1,
    userId: 1,
    title: 'Cake',
    description: 'Chocolate cake',
    preparationTime: 30,
    servings: 8,
    difficulty: 'easy',
    imageUrl: 'http://img.com/cake.jpg',
    createdAt: new Date(),
  };

  const mockSelect = (rows: unknown[]) => {
    db.select.mockReturnValue({
      from: () => ({
        where: () => Promise.resolve(rows),
        orderBy: () => Promise.resolve(rows),
      }),
    });
  };

  beforeEach(() => {
    db = { select: vi.fn(), insert: vi.fn(), delete: vi.fn() };
    service = new RecipesService(db as unknown as Database);
  });

  describe('create', () => {
    it('associates the recipe with the JWT user, not a hardcoded admin', async () => {
      const valuesMock = vi.fn().mockReturnValue({
        returning: () => Promise.resolve([recipeRow]),
      });
      db.insert.mockReturnValue({ values: valuesMock });

      await service.create(dto, user);

      const inserted = valuesMock.mock.calls[0][0] as Record<string, unknown>;
      expect(inserted.userId).toBe(1);
      expect(inserted.title).toBe('Cake');
      expect(inserted.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('delete', () => {
    it('throws ForbiddenException when the recipe belongs to another user', async () => {
      mockSelect([{ id: 2, userId: 2 }]);

      await expect(
        service.delete(2, { id: 1, email: 'maria@email.com' }),
      ).rejects.toMatchObject({ status: 403 });
      expect(db.delete).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when the recipe does not exist', async () => {
      mockSelect([]);

      await expect(service.delete(999, user)).rejects.toMatchObject({
        status: 404,
      });
      expect(db.delete).not.toHaveBeenCalled();
    });

    it('deletes when the user owns the recipe', async () => {
      mockSelect([{ id: 1, userId: 1 }]);
      db.delete.mockReturnValue({ where: () => Promise.resolve(undefined) });

      await expect(service.delete(1, user)).resolves.toBeUndefined();
      expect(db.delete).toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('throws NotFoundException when the recipe does not exist', async () => {
      mockSelect([]);

      await expect(service.getById(999)).rejects.toMatchObject({ status: 404 });
    });
  });

  describe('listIngredients', () => {
    it('throws NotFoundException when the recipe does not exist', async () => {
      mockSelect([]);

      await expect(service.listIngredients(999)).rejects.toMatchObject({
        status: 404,
      });
      // Only the existence check ran; the ingredient query never happened
      expect(db.select).toHaveBeenCalledTimes(1);
    });
  });
});