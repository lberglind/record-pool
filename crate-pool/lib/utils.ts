import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function secToMin(total: number) {
  const mins = Math.floor(total / 60)
  const secs = Math.round(total % 60)
  const formatted = `${mins}:${secs.toString().padStart(2, '0')}`
  return formatted
}
