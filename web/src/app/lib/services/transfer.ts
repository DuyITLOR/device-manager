import type { TransferCreateResponse, TransferRequestDetail } from '../types/transfer';
import { API_BASE_URL } from '../constant/api';
import { getToken } from '../utils/auth';

export async function createTransferRequest(deviceId: string): Promise<TransferCreateResponse> {
  try {
    const token = getToken();
    const res = await fetch(`${API_BASE_URL}/api/transfer/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ deviceId }),
    });
    const json = await res.json();
    if (!res.ok) {
      const msg = json?.message ?? json?.error ?? 'Lỗi khi tạo yêu cầu chuyển thiết bị';
      const err: any = new Error(msg);
      err.status = res.status;
      err.data = json;
      throw err;
    }
    return json.data as TransferCreateResponse;
  } catch (e: any) {
    const msg = e?.message ?? 'Lỗi khi kết nối đến server';
    const err: any = new Error(msg);
    err.status = e?.status ?? (e instanceof TypeError ? 0 : 500);
    err.data = e?.data ?? null;
    throw err;
  }
}

export async function fetchAllTransferRequests(): Promise<TransferRequestDetail[]> {
  try {
    const token = getToken();
    const res = await fetch(`${API_BASE_URL}/api/transfer`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (!res.ok) {
      const msg = json?.message ?? json?.error ?? 'Lỗi khi lấy danh sách yêu cầu chuyển thiết bị';
      const err: any = new Error(msg);
      err.status = res.status;
      err.data = json;
      throw err;
    }
    return json.data as TransferRequestDetail[];
  } catch (e: any) {
    const msg = e?.message ?? 'Lỗi khi kết nối đến server';
    const err: any = new Error(msg);
    err.status = e?.status ?? (e instanceof TypeError ? 0 : 500);
    err.data = e?.data ?? null;
    throw err;
  }
}

export async function updateStatusTransferRequest(
  status: 'APPROVED' | 'REJECTED',
  transferId: string
): Promise<TransferRequestDetail> {
  try {
    const token = getToken();
    const res = await fetch(`${API_BASE_URL}/api/transfer/${transferId}/update`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (!res.ok) {
      const msg = json?.message ?? json?.error ?? 'Lỗi khi cập nhật trạng thái yêu cầu chuyển thiết bị';
      const err: any = new Error(msg);
      err.status = res.status;
      err.data = json;
      throw err;
    }
    return json.data as TransferRequestDetail;
  } catch (e: any) {
    const msg = e?.message ?? 'Lỗi khi kết nối đến server';
    const err: any = new Error(msg);
    err.status = e?.status ?? (e instanceof TypeError ? 0 : 500);
    err.data = e?.data ?? null;
    throw err;
  }
}
