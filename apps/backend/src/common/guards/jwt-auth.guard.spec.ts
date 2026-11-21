import type { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import type { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard.js';

describe('JwtAuthGuard', () => {
  let reflector: Reflector;
  let jwtService: JwtService;
  let configService: ConfigService;
  let guard: JwtAuthGuard;

  const createContext = (headers: Record<string, unknown>) => {
    const request = { headers, user: undefined as unknown };
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
      getHandler: () => undefined,
      getClass: () => undefined,
    };
    return { context, request };
  };

  beforeEach(() => {
    reflector = { getAllAndOverride: vi.fn() } as unknown as Reflector;
    jwtService = { verifyAsync: vi.fn() } as unknown as JwtService;
    configService = { get: vi.fn().mockReturnValue('recipes-app-api') } as unknown as ConfigService;
    guard = new JwtAuthGuard(reflector, jwtService, configService);
  });

  it('lets a @Public route pass without a token', async () => {
    vi.mocked(reflector.getAllAndOverride).mockReturnValue(true);
    const { context } = createContext({});

    await expect(guard.canActivate(context as never)).resolves.toBe(true);
    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('throws UnauthorizedException when the Authorization header is missing', async () => {
    vi.mocked(reflector.getAllAndOverride).mockReturnValue(false);
    const { context } = createContext({});

    await expect(guard.canActivate(context as never)).rejects.toMatchObject({
      status: 401,
    });
  });

  it('throws UnauthorizedException for a malformed Authorization header', async () => {
    vi.mocked(reflector.getAllAndOverride).mockReturnValue(false);
    const { context } = createContext({ authorization: 'Basic abc' });

    await expect(guard.canActivate(context as never)).rejects.toMatchObject({
      status: 401,
    });
  });

  it('throws UnauthorizedException when the token is invalid', async () => {
    vi.mocked(reflector.getAllAndOverride).mockReturnValue(false);
    vi.mocked(jwtService.verifyAsync).mockRejectedValue(new Error('bad token'));
    const { context } = createContext({ authorization: 'Bearer invalid' });

    await expect(guard.canActivate(context as never)).rejects.toMatchObject({
      status: 401,
    });
  });

  it('populates request.user with the JWT payload', async () => {
    vi.mocked(reflector.getAllAndOverride).mockReturnValue(false);
    vi.mocked(jwtService.verifyAsync).mockResolvedValue({
      sub: 'admin@email.com',
      id: 1,
    });
    const { context, request } = createContext({ authorization: 'Bearer valid' });

    await expect(guard.canActivate(context as never)).resolves.toBe(true);
    expect(request.user).toEqual({ id: 1, email: 'admin@email.com' });
  });
});