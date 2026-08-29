import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { hash } from 'bcryptjs';
import type { Database } from '../database/database.provider.js';
import { AuthService } from './auth.service.js';
import type { LoginDto } from './dto/login.dto.js';

describe('AuthService', () => {
  let service: AuthService;
  let db: { select: ReturnType<typeof vi.fn> };
  let jwtService: JwtService;
  let configService: ConfigService;

  const dto: LoginDto = { email: 'admin@email.com', password: '123' };
  let hashedPassword: string;

  const userRow = () => ({
    id: 1,
    name: 'admin',
    email: 'admin@email.com',
    password: hashedPassword,
    avatarUrl: 'admin',
    createdAt: new Date(),
  });

  const mockSelect = (rows: unknown[]) => {
    db.select.mockReturnValue({
      from: () => ({
        where: () => Promise.resolve(rows),
      }),
    });
  };

  beforeAll(async () => {
    hashedPassword = await hash('123', 10);
  });

  beforeEach(() => {
    db = { select: vi.fn() };
    jwtService = { signAsync: vi.fn().mockResolvedValue('signed-token') } as unknown as JwtService;
    configService = { get: vi.fn() } as unknown as ConfigService;
    service = new AuthService(
      db as unknown as Database,
      jwtService,
      configService,
    );
  });

  it('returns { id, accessToken } for valid credentials', async () => {
    mockSelect([userRow()]);

    await expect(service.login(dto)).resolves.toEqual({
      id: 1,
      accessToken: 'signed-token',
    });
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: 'admin@email.com',
      id: 1,
    });
  });

  it('throws UnauthorizedException for a wrong password', async () => {
    mockSelect([userRow()]);

    await expect(
      service.login({ email: 'admin@email.com', password: 'wrong' }),
    ).rejects.toMatchObject({ status: 401 });
  });

  it('throws UnauthorizedException when the user does not exist', async () => {
    mockSelect([]);

    await expect(service.login(dto)).rejects.toMatchObject({ status: 401 });
  });
});