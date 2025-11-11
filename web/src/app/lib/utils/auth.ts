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
