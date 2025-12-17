import type { ActivityLogListResponse, QueryActivityLogParams } from '../types/log';
import { API_BASE_URL } from '../constant/api';
import { getToken } from '../utils/auth';

export async function fetchAllActivityLog(params?: QueryActivityLogParams): Promise<ActivityLogListResponse> {
  try {
    const token = getToken();
    const query = new URLSearchParams();
    if (params) {
      if (params.action) query.append('action', params.action);
      if (params.limit) query.append('limit', params.limit.toString());
      if (params.page) query.append('page', params.page.toString());
      if (params.startDate) query.append('startDate', params.startDate);
      if (params.endDate) query.append('endDate', params.endDate);
    }
    const res = await fetch(`${API_BASE_URL}/api/activity?${query.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });
    const json = await res.json();

    if (!res.ok) {
      const msg = json?.message ?? json?.error ?? 'Lỗi khi tải nhật ký hoạt động';
      const err: any = new Error(msg);
      err.status = res.status;
      err.data = json;
      throw err;
    }

    return json as ActivityLogListResponse;
  } catch (e: any) {
    const msg = e?.message ?? 'Lỗi khi kết nối đến server';
    const err: any = new Error(msg);
    err.status = e?.status ?? (e instanceof TypeError ? 0 : 500);
    err.data = e?.data ?? null;
    throw err;
  }
}
