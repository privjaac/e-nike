export const API_BASE = import.meta.env.VITE_API_BASE_URL;

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

function getAuthHeaders(token?: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const json = (await res.json()) as ApiResponse<T>;
  if (!res.ok) {
    throw new Error(json.error || json.message || `HTTP ${res.status}`);
  }
  return (json.data ?? json) as T;
}

export async function get<T>(url: string, token?: string | null): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: getAuthHeaders(token),
  });
  return handleResponse<T>(res);
}

export async function post<T>(url: string, body: unknown, token?: string | null): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

export async function put<T>(url: string, body: unknown, token?: string | null): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

export async function patch<T>(url: string, body: unknown, token?: string | null): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    method: 'PATCH',
    headers: getAuthHeaders(token),
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

export async function del<T>(url: string, token?: string | null): Promise<T> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${url}`, {
    method: 'DELETE',
    headers,
  });
  return handleResponse<T>(res);
}
