export interface AuthUser {
  id: number;
  email: string;
}

declare module 'express' {
  interface Request {
    user?: AuthUser;
  }
}