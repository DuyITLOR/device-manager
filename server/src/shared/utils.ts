import bcrypt from 'bcrypt';

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

export class ResponseUtil {
  static success<T>(
    data: T,
    message = 'Success',
  ): { data: T; message: string } {
    return { data, message };
  }

  static error(message = 'Error'): { data: false; message: string } {
    return { data: false, message };
  }
}
