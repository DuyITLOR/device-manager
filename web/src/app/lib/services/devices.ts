import type { CreateDevicesDto, Device, DeviceListResponse, DeviceParams } from '../types/device';
import { API_BASE_URL } from '../constant/api';
import { getToken } from '../utils/auth';

export async function fetchAllDevices(params?: DeviceParams): Promise<DeviceListResponse> {
  try {
    const token = getToken();
    const query = new URLSearchParams();
    if (params) {
      if (params.status) query.append('status', params.status);
      if (params.name) query.append('name', params.name);
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
      const msg = json?.message ?? json?.error ?? 'Lỗi khi tải danh sách thiết bị';
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

export async function createDevice(payload: CreateDevicesDto): Promise<Device> {
  try {
    const token = getToken();
    const res = await fetch(`${API_BASE_URL}/api/devices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    const json = await res.json();

    if (!res.ok) {
      const msg = json?.message ?? json?.error ?? 'Lỗi khi tạo thiết bị';
      const err: any = new Error(msg);
      err.status = res.status;
      err.data = json;
      throw err;
    }

    return json as Device;
  } catch (e: any) {
    const msg = e?.message ?? 'Lỗi khi kết nối đến server';
    const err: any = new Error(msg);
    err.status = e?.status ?? (e instanceof TypeError ? 0 : 500);
    err.data = e?.data ?? null;
    throw err;
  }
}

export async function deleteDevice(id: string) {
  try {
    const token = getToken();
    const res = await fetch(`${API_BASE_URL}/api/devices/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });
    const json = await res.json();

    if (!res.ok) {
      const msg = json?.message ?? json?.error ?? 'Lỗi khi xóa thiết bị';
      const err: any = new Error(msg);
      err.status = res.status;
      err.data = json;
      throw err;
    }
    return json;
  } catch (e: any) {
    const msg = e?.message ?? 'Lỗi khi kết nối đến server';
    const err: any = new Error(msg);
    err.status = e?.status ?? (e instanceof TypeError ? 0 : 500);
    err.data = e?.data ?? null;
    throw err;
  }
}

export async function updateDevice(id: string, dto: Partial<CreateDevicesDto>) {
  try {
    const token = getToken();
    const res = await fetch(`${API_BASE_URL}/api/devices/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(dto),
    });
    const json = await res.json();
    if (!res.ok) {
      const msg = json?.message ?? json?.error ?? 'Lỗi khi cập nhật thiết bị';
      const err: any = new Error(msg);
      err.status = res.status;
      err.data = json;
      throw err;
    }
    return json as Device;
  } catch (e: any) {
    const msg = e?.message ?? 'Lỗi khi kết nối đến server';
    const err: any = new Error(msg);
    err.status = e?.status ?? (e instanceof TypeError ? 0 : 500);
    err.data = e?.data ?? null;
    throw err;
  }
}
