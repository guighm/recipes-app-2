export const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).*$/;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;
export const PASSWORD_REQUIREMENTS_MESSAGE =
  `Your password needs at least ${PASSWORD_MIN_LENGTH} characters, with an uppercase letter, a lowercase letter, a number, and a special character (like ! or #).`;

export function isPasswordValid(value: string): boolean {
  return value.length >= PASSWORD_MIN_LENGTH && PASSWORD_PATTERN.test(value);
}
