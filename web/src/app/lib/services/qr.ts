import { API_BASE_URL } from "../constant/api";
import { getToken } from "../utils/auth";

export async function exportQrPdf(ids: string[]): Promise<Blob> {
  try {
    const token = getToken();

    const res = await fetch(`${API_BASE_URL}/api/qr/export`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ids }),
    });

    if (!res.ok) {
      const json = await res.json().catch(() => null);
      const msg =
        json?.message || json?.error || "Không thể xuất QR PDF từ server";
      const err: any = new Error(msg);
      err.status = res.status;
      throw err;
    }

    return await res.blob();
  } catch (e: any) {
    const msg = e?.message ?? "Lỗi khi kết nối server export QR";
    const err: any = new Error(msg);
    err.status = e?.status ?? (e instanceof TypeError ? 0 : 500);
    throw err;
  }
}
