import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC } from '../decorators/public.decorator.js';
import type { AuthUser } from '../request-with-user.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractBearerToken(request.headers['authorization']);

    if (token === undefined) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string; id: number }>(
        token,
        {
          issuer:
            this.configService.get<string>('JWT_ISSUER') ?? 'recipes-app-api',
        },
      );

      const user: AuthUser = { id: payload.id, email: payload.sub };
      request.user = user;
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }

  private extractBearerToken(header: unknown): string | undefined {
    if (typeof header !== 'string' || !header.startsWith('Bearer ')) {
      return undefined;
    }

    return header.slice('Bearer '.length).trim();
  }
}