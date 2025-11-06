export const AUTH_MESSAGES = {
  LOGIN_SUCCESS: { status: 200, message: 'Đăng nhập thành công' },
  SIGNUP_SUCCESS: { status: 200, message: 'Đăng kí thành công' },
  AUTH_MISSING_FIELDS: { status: 400, message: 'Thiếu tên đăng nhập hoặc mật khẩu' },
  AUTH_INVALID_CREDENTIALS: { status: 401, message: 'Sai tên đăng nhập hoặc mật khẩu' },
  AUTH_TOKEN_EXPIRED: { status: 401, message: 'Phiên đăng nhập hết hạn' },
  AUTH_FORBIDDEN_ROLE: { status: 403, message: 'Không đủ quyền truy cập tài nguyên này' },
  AUTH_DUPLICATE_EMAIL: { status: 409, message: 'Email đã tồn tại' },
} as const;

export type AuthErrorCode = keyof typeof AUTH_MESSAGES;

export const ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  MANAGER: 'MANAGER',
} as const;

export type Role = keyof typeof ROLES;