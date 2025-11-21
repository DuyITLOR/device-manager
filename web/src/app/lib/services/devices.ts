import type { DeviceListResponse, DeviceParams } from '../types/device';
import { API_BASE_URL } from '../constant/api';
import { getToken } from '../utils/auth';

export async function fetchAllDevices(params?: DeviceParams): Promise<DeviceListResponse> {
  try {
    const token = getToken();
    const query = new URLSearchParams();
    if (params) {
      if (params.status) query.append('status', params.status);
      if (params.search) query.append('search', params.search);
      if (params.limit) query.append('limit', params.limit.toString());
      if (params.page) query.append('page', params.page.toString());
    }
    const queryString = query.toString();
    const url = `${API_BASE_URL}/api/devices${queryString ? `?${queryString}` : ''}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });
    const json = await res.json();

    if (!res.ok) {
      const msg = json?.message ?? json?.error ?? 'Failed to fetch devices';
      const err: any = new Error(msg);
      err.status = res.status;
      err.data = json;
      throw err;
    }

    return json as DeviceListResponse;
  } catch (e: any) {
    const msg = e?.message ?? 'Lỗi khi kết nối đến server';
    const err: any = new Error(msg);
    err.status = e?.status ?? (e instanceof TypeError ? 0 : 500);
    err.data = e?.data ?? null;
    throw err;
  }
}
