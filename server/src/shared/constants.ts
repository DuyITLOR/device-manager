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

export const USER_MESSAGES = {
  USER_NOT_FOUND:                { status: 404, message: 'Người dùng không tồn tại' },
  USER_DUPLICATE_EMAIL:          { status: 409, message: 'Email đã được sử dụng' },
  USER_FORBIDDEN_UPDATE_OTHERS:  { status: 403, message: 'Không có quyền cập nhật thông tin người khác' },
  USER_FORBIDDEN_CHANGE_PASSWORD_OTHERS: { status: 403, message: 'Không có quyền đổi mật khẩu người khác' },
  USER_WRONG_PASSWORD:           { status: 400, message: 'Mật khẩu hiện tại không đúng' },
  USER_CREATE_SUCCESS:           { status: 201, message: 'Tạo người dùng thành công' },
  USER_UPDATE_SUCCESS:           { status: 200, message: 'Cập nhật người dùng thành công' },
  USER_DELETE_SUCCESS:           { status: 200, message: 'Xóa người dùng thành công' },
} as const;


export const ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  MANAGER: 'MANAGER',
} as const;

export type Role = keyof typeof ROLES;