export function saveToken(token: string) {
  localStorage.setItem('accessToken', token);
}

export function getToken(): string | null {
  return localStorage.getItem('accessToken');
}

export function clearToken() {
  localStorage.removeItem('accessToken');
}

export function isAuthenticated(): boolean {
  return getToken() !== null;
}

export function saveName(name: string) {
  localStorage.setItem('userName', name);
}

export function getName(): string | null {
  return localStorage.getItem('userName');
}

export function saveRole(role: string) {
  localStorage.setItem('userRole', role);
}

export function getRole(): string | null {
  return localStorage.getItem('userRole');
}

export function clearUserInfo() {
  localStorage.removeItem('userName');
  localStorage.removeItem('userRole');
  clearToken();
}

/**
 * Require authentication and authorization for a page.
 * Performs the same toast + redirect behavior used across the app.
 * Returns true when the user is authenticated and has one of the allowed roles.
 *
 * Usage: call from a client component and pass Next `router` and `toast`.
 */
export const requireAuthAndRole = (
  router: { push: (path: string) => void },
  // Accept a generic toast function to avoid coupling to the hook's exact types
  toast: (options: any) => any,
  allowedRoles: string[] = ['ADMIN']
): boolean => {
  if (!isAuthenticated()) {
    toast({ title: 'Yêu cầu đăng nhập', description: 'Vui lòng đăng nhập để truy cập trang này' });
    router.push('/login');
    return false;
  }

  if (!isAuthorized(allowedRoles)) {
    toast({
      title: 'Không có quyền',
      description: 'Bạn không có quyền truy cập trang quản trị',
      variant: 'destructive',
    });
    router.push('/');
    return false;
  }

  return true;
};

// Check if the stored role (from localStorage) matches any of the allowed roles.
// Use this on the client only for UI gating. Server-side guards remain the source of truth.
export function isAuthorized(allowedRoles: string[] = []): boolean {
  if (allowedRoles.length === 0) return true;
  const role = getRole();
  if (!role) return false;
  return allowedRoles.map((r) => r.toLowerCase()).includes(role.toLowerCase());
}
