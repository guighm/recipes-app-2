import { ApiError } from './api';

export function errorMessage(
  error: unknown,
  forbiddenMessage = "You don't have permission to perform this action.",
): string {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return 'Unauthorized. Sign in again.';
    }
    if (error.status === 403) {
      return forbiddenMessage;
    }
    return error.message;
  }
  return 'Server connection failed.';
}