const BASE_URL = "https://saloonbookwise-system.vercel.app/api"
function getToken(): string | null { return localStorage.getItem("bookwise_token"); }

export async function apiRequest<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: options.method || "GET",
    headers: { "Content-Type": "application/json", ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data as T;
}

export function setToken(token: string) { localStorage.setItem("bookwise_token", token); }
export function clearToken() { localStorage.removeItem("bookwise_token"); }
