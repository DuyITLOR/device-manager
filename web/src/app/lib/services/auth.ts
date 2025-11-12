import type { SigninDto, SigninResponse, SignupDto, SignupResponse } from '../types/auth';
import { API_BASE_URL } from '../constant/api';

export async function signin(payload: SigninDto): Promise<SigninResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const json = await res.json();

    if (!res.ok) {
      const msg = json?.message ?? json?.error ?? 'Đăng nhập thất bại';
      const err: any = new Error(msg);
      err.status = res.status;
      err.data = json;
      throw err;
    }

    return json as SigninResponse;
  } catch (e: any) {
    const msg = e?.message ?? 'Lỗi khi kết nối đến server';
    const err: any = new Error(msg);
    err.status = e?.status ?? (e instanceof TypeError ? 0 : 500);
    err.data = e?.data ?? null;
    throw err;
  }
}

export async function signup(payload: SignupDto): Promise<SignupResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const json = await res.json();

    if (!res.ok) {
      const msg = json?.message ?? json?.error ?? 'Đăng ký thất bại';
      const err: any = new Error(msg);
      err.status = res.status;
      err.data = json;
      throw err;
    }

    return json as SignupResponse;
  } catch (e: any) {
    const msg = e?.message ?? 'Lỗi khi kết nối đến server';
    const err: any = new Error(msg);
    err.status = e?.status ?? (e instanceof TypeError ? 0 : 500);
    err.data = e?.data ?? null;
    throw err;
  }
}
