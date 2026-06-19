import { getApiErrorMessage } from "@/services/api.service"
import { getZodErrorMessage } from "@/validators/validation"
import type { ClassValue } from "clsx"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { toast } from "vue-sonner"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function showErrorToast(error: unknown, fallback: string) {
    const message = getZodErrorMessage(error) ?? getApiErrorMessage(error, fallback)

    if (message) {
        toast.error(message)
    }
}
