import { plainToInstance } from 'class-transformer';
import { IsString } from 'class-validator';
import { validateSync } from 'class-validator';

export class Environment {
  @IsString()
  DATABASE_URL!: string;

  @IsString()
  DB_USERNAME!: string;

  @IsString()
  DB_PASSWORD!: string;

  @IsString()
  PORT!: string;

  @IsString()
  ALLOWED_ORIGIN!: string;

  @IsString()
  JWT_SECRET!: string;

  @IsString()
  JWT_EXPIRATION_MS!: string;

  @IsString()
  JWT_ISSUER!: string;
}

export function validateEnv(raw: Record<string, unknown>): Environment {
  const instance = plainToInstance(Environment, raw, {
    exposeDefaultValues: true,
  });

  // Sensible defaults so a local `pnpm start:dev` works out of the box.
  instance.PORT ??= '3000';
  instance.ALLOWED_ORIGIN ??= 'http://localhost:5173';
  instance.JWT_EXPIRATION_MS ??= '72000000';
  instance.JWT_ISSUER ??= 'recipes-app-api';
  instance.DATABASE_URL ??= `postgres://${instance.DB_USERNAME ?? 'root'}:${instance.DB_PASSWORD ?? '123'}@localhost:5432/recipes_app`;

  const errors = validateSync(instance, { skipMissingProperties: true });
  if (errors.length > 0) {
    throw new Error(
      `Environment validation failed:\n${errors.map((e) => `  - ${String(e.property)}: ${JSON.stringify(e.constraints)}`).join('\n')}`,
    );
  }

  return instance;
}