import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Fusionne les classes Tailwind en évitant les conflits.
 * Utilisation : cn('px-4', condition && 'py-2', className)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
