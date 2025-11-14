import type { User, UpdateUserDto } from '../types/user';
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

export async function updateUser(id: string, dto: UpdateUserDto) {
  try {
    const token = getToken();
    const payload: any = {};
    if (dto.name !== undefined) payload.name = dto.name;
    if (dto.code !== undefined) payload.code = dto.code;
    if (dto.role !== undefined) payload.role = dto.role;

    const res = await fetch(`${API_BASE_URL}/api/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok) {
      const msg = json?.message ?? json?.error ?? 'Failed to update user';
      const err: any = new Error(msg);
      err.status = res.status;
      err.data = json;
      throw err;
    }

    return json?.data ?? json;
  } catch (e: any) {
    const msg = e?.message ?? 'Lỗi khi kết nối đến server';
    const err: any = new Error(msg);
    err.status = e?.status ?? (e instanceof TypeError ? 0 : 500);
    err.data = e?.data ?? null;
    throw err;
  }
}

export async function deleteUser(id: string) {
  try {
    const token = getToken();
    const res = await fetch(`${API_BASE_URL}/api/users/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (!res.ok) {
      const msg = json?.message ?? json?.error ?? 'Failed to delete user';
      const err: any = new Error(msg);
      err.status = res.status;
      err.data = json;
      throw err;
    }
    return json?.data ?? json;
  } catch (e: any) {
    const msg = e?.message ?? 'Lỗi khi kết nối đến server';
    const err: any = new Error(msg);
    err.status = e?.status ?? (e instanceof TypeError ? 0 : 500);
    err.data = e?.data ?? null;
    throw err;
  }
}
