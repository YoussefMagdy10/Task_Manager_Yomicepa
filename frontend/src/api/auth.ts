import { http } from "./http";

export type AuthResponse = { ok: true; accessToken: string };

export async function signup(input: { email: string; username: string; password: string }) {
  const res = await http.post<AuthResponse>("/api/auth/signup", input);
  return res.data;
}

export async function signin(input: { email: string; password: string }) {
  const res = await http.post<AuthResponse>("/api/auth/signin", input);
  return res.data;
}

export async function refresh() {
  const res = await http.post<AuthResponse>("/api/auth/refresh");
  return res.data;
}

export async function logout() {
  const res = await http.post<{ ok: true }>("/api/auth/logout");
  return res.data;
}

export async function me() {
  const res = await http.get<{ ok: true; user: { id: string; email: string; username: string } }>("/api/me");
  return res.data;
}
