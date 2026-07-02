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
  if (diffSeconds < 3600) return `Il y a ${Math.floor(diffSeconds / 60)} min`
  if (diffSeconds < 86400) return `Il y a ${Math.floor(diffSeconds / 3600)} h`
  if (diffSeconds < 604800) return `Il y a ${Math.floor(diffSeconds / 86400)} j`

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
  if (!name || typeof name !== 'string') return '??'

  // On nettoie les espaces et on récupère tous les mots sous forme de tableau
  const words = name.trim().split(/\s+/)

  if (words.length === 0) return '??'
  if (words.length === 1) return words[0][0].toUpperCase()

  // On prend la première lettre du premier mot et du dernier mot
  const firstInitial = words[0][0]
  const lastInitial = words[words.length - 1][0]

  return (firstInitial + lastInitial).toUpperCase()
}

/**
 * Tronque un texte à la longueur indiquée.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 3)}...`
}
