import { getToken } from '../utils/auth';
import { API_BASE_URL } from '../constant/api';
import { LoansParams, LoansResponse } from '../types/loan';

export const fetchAllLoans = async (params?: LoansParams): Promise<LoansResponse> => {
  try {
    const token = getToken();
    if (!token) throw new Error('Không tìm thấy token xác thực');

    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.set('search', params.search);
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.page) queryParams.set('page', params.page.toString());
    queryParams.set('status', 'BORROWED');

    const url = `${API_BASE_URL}/api/loans${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const json = await res.json();

    if (!res.ok) {
      const msg = json?.message ?? json?.error ?? 'Lỗi khi tải danh sách thiết bị đã mượn';
      const err: any = new Error(msg);
      err.status = res.status;
      err.data = json;
      throw err;
    }
    return json as LoansResponse;
  } catch (e: any) {
    const msg = e?.message ?? 'Lỗi khi kết nối đến server';
    const err: any = new Error(msg);
    err.status = e?.status ?? (e instanceof TypeError ? 0 : 500);
    err.data = e?.data ?? null;
    throw err;
  }
};
