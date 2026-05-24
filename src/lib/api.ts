interface BackendResponse<T> {
  code: string;
  message?: string;
  data: T;
}

async function request<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  const token = localStorage.getItem('accessToken');
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401 && !path.startsWith('/auth/')) {
    if (retry) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const refreshRes = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });
          if (refreshRes.ok) {
            const refreshJson: BackendResponse<{ accessToken: string; refreshToken: string }> = await refreshRes.json();
            localStorage.setItem('accessToken', refreshJson.data.accessToken);
            localStorage.setItem('refreshToken', refreshJson.data.refreshToken);
            return request<T>(path, options, false);
          }
        } catch {
          // refresh 실패 시 아래 로그아웃 처리로 이어짐
        }
      }
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
    throw new Error('인증이 만료되었습니다');
  }

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  if (!text) {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return undefined as T;
  }

  const json: BackendResponse<T> = JSON.parse(text);

  if (!res.ok) {
    throw new Error(json.message ?? `HTTP ${res.status}`);
  }

  return json.data;
}

export const api = {
  get:   <T>(path: string)                => request<T>(path),
  post:  <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST',   body: body !== undefined ? JSON.stringify(body) : undefined }),
  put:   <T>(path: string, body: unknown)  => request<T>(path, { method: 'PUT',    body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown)  => request<T>(path, { method: 'PATCH',  body: JSON.stringify(body) }),
  del:   <T>(path: string)                => request<T>(path, { method: 'DELETE' }),
};
