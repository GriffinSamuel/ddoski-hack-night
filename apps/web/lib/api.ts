import {
  API_PATHS,
  ROAST_CODE_MAX_CHARS,
  ROAST_TIMEOUT_MS,
  type ErrorEnvelope,
  type HealthResponse,
  type RoastRequest,
  type RoastResponse,
} from "@/lib/api-types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function errorFrom(res: Response): Promise<ApiError> {
  try {
    const body = (await res.json()) as ErrorEnvelope;
    return new ApiError(res.status, body.error.code, body.error.message);
  } catch {
    return new ApiError(res.status, "internal_error", res.statusText);
  }
}

/** GET /api/v1/health (operationId getHealth). Short timeout; callers must never block on it. */
export async function getHealth(timeoutMs = 3000): Promise<HealthResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${BASE_URL}${API_PATHS.health}`, { signal: controller.signal, cache: "no-store" });
    if (!res.ok) throw await errorFrom(res);
    return (await res.json()) as HealthResponse;
  } finally {
    clearTimeout(timer);
  }
}

function isRoastResponse(value: unknown): value is RoastResponse {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  if (v.kind === "lines") return Array.isArray(v.lines) && v.lines.length > 0;
  if (v.kind === "replacement") return Array.isArray(v.mock_lines) && Array.isArray(v.art_lines);
  return false;
}

/** POST /api/v1/roast (operationId createRoast). Aborts at ROAST_TIMEOUT_MS. Throws ApiError or an abort/network error. */
export async function createRoast(body: RoastRequest): Promise<RoastResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ROAST_TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE_URL}${API_PATHS.roast}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, code: body.code.slice(0, ROAST_CODE_MAX_CHARS) }),
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) throw await errorFrom(res);
    const data: unknown = await res.json();
    if (!isRoastResponse(data)) throw new ApiError(res.status, "ai_error", "Unexpected response shape");
    return data;
  } finally {
    clearTimeout(timer);
  }
}
