import type { ApiError, RequestOptions } from "@/types/api.type"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000"

function buildUrl(path: string): string {
    if (/^https?:\/\//.test(path)) {
        return path
    }

    return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`
}

async function parseResponse(response: Response): Promise<unknown> {
    const text = await response.text()

    if (!text) {
        return null
    }

    try {
        return JSON.parse(text) as unknown
    } catch {
        return text
    }
}

function toApiError(response: Response, payload: unknown): ApiError {
    const body = payload as { message?: unknown; code?: unknown; error?: unknown }
    const message =
        typeof body?.message === "string"
            ? body.message
            : typeof body?.error === "string"
              ? body.error
              : "Request failed"

    return {
        status: response.status,
        message,
        code: typeof body?.code === "string" ? body.code : undefined,
        details: payload,
    }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const response = await fetch(buildUrl(path), {
        method: options.method ?? "GET",
        credentials: "include",
        headers: {
            Accept: "application/json",
            ...(options.body ? { "Content-Type": "application/json" } : {}),
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: options.signal,
    })
    const payload = await parseResponse(response)

    if (!response.ok) {
        throw toApiError(response, payload)
    }

    return payload as T
}

export function isApiError(error: unknown): error is ApiError {
    return Boolean(error && typeof error === "object" && "status" in error && "message" in error)
}
