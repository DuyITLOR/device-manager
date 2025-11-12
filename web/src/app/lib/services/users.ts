import type { User } from '../types/user';
import { API_BASE_URL } from '../constant/api';
import { getToken } from '../utils/auth';

export async function fetchAllUsers(): Promise<User[]> {
  try {
    const token = getToken();
    const res = await fetch(`${API_BASE_URL}/api/users`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });

    const json = await res.json();

    if (!res.ok) {
      const msg = json?.message ?? json?.error ?? 'Failed to fetch users';
      const err: any = new Error(msg);
      err.status = res.status;
      err.data = json;
      throw err;
    }

    const list: any = Array.isArray(json) ? json : json?.data ?? [];

    return list as User[];
  } catch (e: any) {
    const msg = e?.message ?? 'Lỗi khi kết nối đến server';
    const err: any = new Error(msg);
    err.status = e?.status ?? (e instanceof TypeError ? 0 : 500);
    err.data = e?.data ?? null;
    throw err;
  }
}
