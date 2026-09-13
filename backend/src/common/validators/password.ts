export const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).*$/;
export const PASSWORD_PATTERN_MESSAGE =
  'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character';
export const PASSWORD_MIN_LENGTH = 8;
// bcrypt only hashes the first 72 bytes; anything past that is silently ignored.
export const PASSWORD_MAX_LENGTH = 72;
