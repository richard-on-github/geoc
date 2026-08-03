/**
 * Formate une date ISO en date lisible française.
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('fr-TG', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

/**
 * Formate une date ISO en date + heure.
 */
export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('fr-TG', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

/**
 * Formate une date en relatif (il y a X minutes...).
 */
export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const target = new Date(date)
  const diffMs = now.getTime() - target.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)

  if (diffSeconds < 60) return "À l'instant"
  if (diffSeconds < 3600) return `Il y a ${String(Math.floor(diffSeconds / 60))} min`
  if (diffSeconds < 86400) return `Il y a ${String(Math.floor(diffSeconds / 3600))} h`
  if (diffSeconds < 604800) return `Il y a ${String(Math.floor(diffSeconds / 86400))} j`

  return formatDate(date)
}

/**
 * Capitalise la première lettre d'une chaîne.
 */
export function capitalize(str: string): string {
  if (str.length === 0) return str
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Génère les initiales d'un nom complet (max 2 caractères).
 */
export const getInitials = (name?: string): string => {
  const normalizedName = name?.trim()

  if (normalizedName === undefined || normalizedName === '') {
    return '??'
  }

  const words = normalizedName.split(/\s+/)

  if (words.length === 0) {
    return '??'
  }

  const firstWord = words[0]
  const lastWord = words[words.length - 1]

  if (firstWord === undefined || lastWord === undefined) {
    return '??'
  }

  if (firstWord === '' || lastWord === '') {
    return '??'
  }

  if (words.length === 1) {
    const firstChar = firstWord[0]
    return firstChar === undefined ? '?' : firstChar.toUpperCase()
  }

  const firstInitial = firstWord[0]
  const lastInitial = lastWord[0]

  if (firstInitial === undefined || lastInitial === undefined) {
    return '?'
  }

  return `${firstInitial.toUpperCase()}${lastInitial.toUpperCase()}`
}

/**
 * Tronque un texte à la longueur indiquée.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 3)}...`
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(amount)
}
