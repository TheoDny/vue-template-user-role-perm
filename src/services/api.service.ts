import type { ApiError, RequestOptions } from "@/types/api.type"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000"

export type ApiErrorHandlerContext = {
    path: string
    options: RequestOptions
    retry: () => Promise<unknown>
}

export type ApiErrorHandler = (error: ApiError, context: ApiErrorHandlerContext) => void | Promise<void>

let globalApiErrorHandler: ApiErrorHandler | null = null

export function setGlobalApiErrorHandler(handler: ApiErrorHandler | null) {
    globalApiErrorHandler = handler
}

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

function toNetworkError(error: unknown): ApiError {
    return {
        status: 0,
        message: "Network unavailable. Check your connection and try again.",
        code: "NETWORK_ERROR",
        details: error,
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

async function handleApiError(error: ApiError, path: string, options: RequestOptions) {
    if (options.skipGlobalErrorHandler || !globalApiErrorHandler) {
        return
    }

    await globalApiErrorHandler(error, {
        path,
        options,
        retry: () => apiRequest(path, { ...options, skipGlobalErrorHandler: false }),
    })
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
    let response: Response

    try {
        response = await fetch(buildUrl(path), {
            method: options.method ?? "GET",
            credentials: "include",
            headers: {
                Accept: "application/json",
                ...(options.body ? { "Content-Type": "application/json" } : {}),
            },
            body: options.body ? JSON.stringify(options.body) : undefined,
            signal: options.signal,
        })
    } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
            throw error
        }

        const apiError = toNetworkError(error)
        await handleApiError(apiError, path, options)
        throw apiError
    }

    const payload = await parseResponse(response)

    if (!response.ok) {
        const apiError = toApiError(response, payload)
        await handleApiError(apiError, path, options)
        throw apiError
    }

    return payload as T
}

export function isApiError(error: unknown): error is ApiError {
    return Boolean(error && typeof error === "object" && "status" in error && "message" in error)
}

export function getApiErrorMessage(error: unknown, fallback: string): string | null {
    if (isApiError(error)) {
        return error.handled ? null : error.message
    }

    return fallback
}
