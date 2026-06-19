import { z } from "zod"

export function getZodErrorMessage(error: unknown): string | null {
    if (!(error instanceof z.ZodError)) {
        return null
    }

    return error.issues[0]?.message ?? "Invalid form data"
}
