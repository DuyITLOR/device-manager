import type { User, UpdateUserDto, UserParams, UserListResponse } from '../types/user';
import { API_BASE_URL } from '../constant/api';
import { getToken } from '../utils/auth';

export async function fetchAllUsers(params?: UserParams): Promise<UserListResponse> {
  try {
    const token = getToken();
    const query = new URLSearchParams();
    if (params) {
      if (params.role) query.append('role', params.role);
      if (params.name) query.append('name', params.name);
      if (params.code) query.append('code', params.code);
      if (params.limit) query.append('limit', params.limit.toString());
      if (params.page) query.append('page', params.page.toString());
    }

    const queryString = query.toString();
    const url = `${API_BASE_URL}/api/users${queryString ? `?${queryString}` : ''}`;

    const res = await fetch(url, {
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

    if (json?.data && json?.meta) {
      return json as UserListResponse;
    }

    const data: User[] = Array.isArray(json) ? json : json?.data ?? [];
    const meta = json?.meta ?? {
      total: data.length,
      page: params?.page ?? 1,
      limit: params?.limit ?? data.length,
      totalPages: params?.limit ? Math.max(1, Math.ceil(data.length / params.limit)) : 1,
      hasMore: false,
    };

    return {
      status: json?.status ?? res.status,
      success: json?.success ?? true,
      message: json?.message ?? 'Lấy danh sách người dùng thành công',
      meta,
      data,
    };
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
