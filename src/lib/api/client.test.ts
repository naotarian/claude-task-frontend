import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch, ApiError } from "./client";

function mockResponse(body: unknown, init: { status?: number } = {}) {
  const status = init.status ?? 200;
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe("apiFetch", () => {
  beforeEach(() => {
    document.cookie = "XSRF-TOKEN=test-token";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns parsed JSON for a successful GET", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockResponse({ id: 1, name: "Acme" }));
    vi.stubGlobal("fetch", fetchMock);

    const data = await apiFetch<{ id: number; name: string }>("/api/organizations");
    expect(data).toEqual({ id: 1, name: "Acme" });

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain("/api/organizations");
    expect(options.credentials).toBe("include");
  });

  it("bootstraps CSRF and sends the token header for mutations", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(mockResponse({}, { status: 204 })) // csrf-cookie
      .mockResolvedValueOnce(mockResponse({ id: 5 }, { status: 201 })); // POST
    vi.stubGlobal("fetch", fetchMock);

    const data = await apiFetch<{ id: number }>("/api/organizations", {
      method: "POST",
      body: { name: "X" },
    });
    expect(data).toEqual({ id: 5 });

    const postCall = fetchMock.mock.calls.find(([, o]) => o?.method === "POST");
    expect(postCall?.[1].headers["X-XSRF-TOKEN"]).toBe("test-token");
    expect(postCall?.[1].headers["Content-Type"]).toBe("application/json");
  });

  it("returns undefined on 204", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockResponse(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    const data = await apiFetch<void>("/api/tasks/1", { method: "DELETE" });
    expect(data).toBeUndefined();
  });

  it("throws ApiError with validation errors on 422", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      mockResponse({ message: "検証エラー", errors: { email: ["必須です"] } }, { status: 422 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    try {
      await apiFetch("/api/login", { method: "POST", body: {} });
      throw new Error("should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      const err = e as ApiError;
      expect(err.status).toBe(422);
      expect(err.validationErrors.email).toContain("必須です");
    }
  });
});
