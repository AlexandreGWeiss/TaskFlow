import { clearToken, getToken } from "@/lib/auth";
import type { ApiErrorBody } from "@/types/api";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333","https://taskflow-backend-h7qm.onrender.com").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) { super(message); this.name = "ApiError"; }
}

export async function api<T>(path: string, options: RequestInit = {}, authenticated = true): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const token = getToken();
  if (authenticated && token) headers.set("Authorization", `Bearer ${token}`);
  let response: Response;
  try { response = await fetch(`${API_URL}${path}`, { ...options, headers }); }
  catch { throw new ApiError("Não foi possível conectar ao servidor. Tente novamente.", 0); }
  if (response.status === 204) return undefined as T;
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401 && authenticated) {
      clearToken();
      if (typeof window !== "undefined" && !["/login", "/register"].includes(window.location.pathname)) window.location.assign("/login");
    }
    const payload = body as ApiErrorBody | null;
    const message = Array.isArray(payload?.message) ? payload.message.join(" ") : payload?.message;
    throw new ApiError(message || ({ 400: "Confira os dados informados.", 401: "E-mail ou senha inválidos.", 403: "Você não tem permissão para esta ação.", 404: "O item solicitado não foi encontrado.", 500: "Ocorreu um erro no servidor." }[response.status] ?? "Não foi possível concluir a solicitação."), response.status);
  }
  return body as T;
}

export const json = (method: string, value?: unknown): RequestInit => ({ method, ...(value === undefined ? {} : { body: JSON.stringify(value) }) });
