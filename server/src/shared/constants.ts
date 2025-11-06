export const AUTH_MESSAGES = {
  LOGIN_SUCCESS: { status: 200, message: 'Login successful' },
  SIGNUP_SUCCESS: { status: 200, message: 'Signup successful' },
  AUTH_MISSING_FIELDS: { status: 400, message: 'Missing username or password' },
  AUTH_INVALID_CREDENTIALS: { status: 401, message: 'Invalid username or password' },
  AUTH_TOKEN_EXPIRED: { status: 401, message: 'Session has expired' },
  AUTH_FORBIDDEN_ROLE: { status: 403, message: 'You do not have permission to access this resource' },
  AUTH_DUPLICATE_EMAIL: { status: 409, message: 'Email already exists' },
} as const;

export type AuthErrorCode = keyof typeof AUTH_MESSAGES;

export const ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  MANAGER: 'MANAGER',
} as const;

export type Role = keyof typeof ROLES;