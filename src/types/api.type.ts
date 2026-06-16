export type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE"

export type ApiError = {
  status: number
  message: string
  code?: string
  details?: unknown
}

export type RequestOptions = {
  method?: HttpMethod
  body?: unknown
  signal?: AbortSignal
}

