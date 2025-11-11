import * as bcrypt from 'bcrypt';

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(
  password: string,
  hashedPassword: string,
) {
  return bcrypt.compare(password, hashedPassword);
}

export class ResponseUtil {
  static success(data: any, message = 'Success') {
    return { data, message };
  }

  static error(message = 'Error') {
    return { data: false, message };
  }
}
