const BASE_URL =
  "https://salon-backend-4vpmnj8lu-makentriclabs1-5493.vercel.app/api";

function getToken(): string | null {
  return localStorage.getItem("bookwise_token");
}

export async function apiRequest<T>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
  } = {}
): Promise<T> {
  const token = getToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      data.error || `Request failed (${res.status})`
    );
  }

  return data as T;
}

export function setToken(token: string): void {
  localStorage.setItem("bookwise_token", token);
}

export function clearToken(): void {
  localStorage.removeItem("bookwise_token");
}
