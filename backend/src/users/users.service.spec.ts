import type { Database } from '../database/database.provider.js';
import { UsersService } from './users.service.js';
import type { CreateUserDto } from './dto/create-user.dto.js';

describe('UsersService', () => {
  let service: UsersService;
  let db: {
    select: ReturnType<typeof vi.fn>;
    insert: ReturnType<typeof vi.fn>;
  };
  let valuesMock: ReturnType<typeof vi.fn>;

  const dto: CreateUserDto = {
    name: 'Maria',
    email: 'maria@email.com',
    password: 'secret123',
    avatarUrl: 'maria',
  };

  beforeEach(() => {
    db = { select: vi.fn(), insert: vi.fn() };
    service = new UsersService(db as unknown as Database);
  });

  it('throws ConflictException when the email is already registered', async () => {
    db.select.mockReturnValue({
      from: () => ({
        where: () => Promise.resolve([{ id: 1 }]),
      }),
    });

    await expect(service.create(dto)).rejects.toMatchObject({ status: 409 });
    expect(db.insert).not.toHaveBeenCalled();
  });

  it('hashes the password and the result never exposes it', async () => {
    db.select.mockReturnValue({
      from: () => ({
        where: () => Promise.resolve([]),
      }),
    });

    valuesMock = vi.fn().mockReturnValue({
      returning: () =>
        Promise.resolve([
          { id: 1, name: 'Maria', email: 'maria@email.com', avatarUrl: 'maria', createdAt: new Date() },
        ]),
    });
    db.insert.mockReturnValue({ values: valuesMock });

    const user = await service.create(dto);

    const inserted = valuesMock.mock.calls[0][0] as { password: string };
    expect(inserted.password).not.toBe('secret123');
    expect(user).not.toHaveProperty('password');
  });
});