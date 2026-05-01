const rawBase = import.meta.env.VITE_API_URL || "/api";

export const API_BASE = rawBase.replace(/\/$/, "");

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${normalizedPath}`;
}
