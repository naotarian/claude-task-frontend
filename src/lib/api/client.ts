// Thin fetch wrapper for the Laravel API using Sanctum SPA cookie auth.
//
// Flow: call `ensureCsrf()` once before the first mutating request to obtain
// the XSRF-TOKEN cookie, then send it back in the `X-XSRF-TOKEN` header.

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }

  /** Laravel validation errors: { field: string[] }. */
  get validationErrors(): Record<string, string[]> {
    const b = this.body as { errors?: Record<string, string[]> } | null;
    return b?.errors ?? {};
  }
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[2]) : null;
}

let csrfReady = false;

export async function ensureCsrf(): Promise<void> {
  if (csrfReady) return;
  await fetch(`${BASE_URL}/sanctum/csrf-cookie`, { credentials: "include" });
  csrfReady = true;
}

type ApiOptions = {
  method?: string;
  body?: unknown;
  // Set for multipart uploads; body must be a FormData instance.
  formData?: FormData;
};

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const method = options.method ?? "GET";
  const mutating = method !== "GET" && method !== "HEAD";

  if (mutating) {
    await ensureCsrf();
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  const xsrf = readCookie("XSRF-TOKEN");
  if (xsrf) headers["X-XSRF-TOKEN"] = xsrf;

  let body: BodyInit | undefined;
  if (options.formData) {
    body = options.formData;
  } else if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body,
    credentials: "include",
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      (payload as { message?: string } | null)?.message ?? `Request failed (${res.status})`;
    throw new ApiError(res.status, message, payload);
  }

  return payload as T;
}
