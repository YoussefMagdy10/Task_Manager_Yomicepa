import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // Ito send refresh cookie
});

// attach token dynamically (set by AuthProvider)
let accessToken: string | null = null;
export function setAccessToken(token: string | null) {
  accessToken = token;
}

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Simple one-shot refresh retry logic
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const res = await http.post("/api/auth/refresh");
  return res.data?.accessToken ?? null;
}

http.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<any>) => {
    const status = error.response?.status;
    const code = error.response?.data?.error?.code;

    const shouldTryRefresh =
      status === 401 && (code === "ACCESS_TOKEN_EXPIRED" || code === "INVALID_ACCESS_TOKEN");

    const original = error.config as any;
    if (!shouldTryRefresh || original?._retry) throw error;

    original._retry = true;

    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshAccessToken()
        .catch(() => null)
        .finally(() => {
          isRefreshing = false;
        });
    }

    const newToken = await refreshPromise;
    if (!newToken) throw error;

    setAccessToken(newToken);
    return http.request(original);
  }
);
