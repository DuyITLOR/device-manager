import bcrypt from 'bcrypt';
import { LogDiff } from '../modules/activity/interfaces/logger.interface';

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

export function generateDiff(oldObj: any, newObj: any): LogDiff['diff'] | null {
  const diff: LogDiff['diff'] = {};
  let hasChange = false;

  for (const key in newObj) {
    if (key === 'updatedAt' || key === 'deletedAt') continue;
    if (
      Object.prototype.hasOwnProperty.call(newObj, key) &&
      oldObj[key] !== newObj[key]
    ) {
      diff[key] = {
        old: oldObj[key],
        new: newObj[key],
      };
      hasChange = true;
    }
  }

  return hasChange ? diff : null;
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
