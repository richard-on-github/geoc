import { useState, useEffect } from 'react'

/**
 * Retarde la mise à jour d'une valeur.
 * Utilisé pour les champs de recherche afin d'éviter une requête à chaque frappe.
 */
export function useDebounce<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debouncedValue
}
