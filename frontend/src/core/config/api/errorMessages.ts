import { ApiError } from './api';

/**
 * Translates an API error into the message shown to the user. Avoids
 * repeating the same `instanceof`/`status` chain on every page.
 */
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return 'Unauthorized. Sign in again.';
    }
    if (error.status === 403) {
      return "You cannot delete another user's recipes.";
    }
    return error.message;
  }
  return 'Server connection failed.';
}