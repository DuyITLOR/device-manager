import type { SigninDto, SigninResponse } from '../types/auth';
import { API_BASE_URL } from '../constant/api';

export async function signin(payload: SigninDto): Promise<SigninResponse> {
  const res = await fetch(`${API_BASE_URL}/api/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const json = await res.json();

  if (!res.ok) {
    const msg = json?.message ?? json?.error ?? 'Signin failed';
    const err: any = new Error(msg);
    err.status = res.status;
    err.data = json;
    throw err;
  }

  return json as SigninResponse;
}
