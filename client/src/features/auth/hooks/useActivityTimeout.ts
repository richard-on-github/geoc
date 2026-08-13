import { useEffect, useRef, useCallback } from 'react'
import { useLogout } from './useLogout'

// Définis ici le temps d'inactivité (ex: 15 minutes en millisecondes)
const SESSION_TIMEOUT_MS = 5 * 60 * 1000

export function useActivityTimeout() {
  const { mutate: logout } = useLogout()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleTimeout = useCallback(() => {
    // Déclenche la déconnexion et la redirection[cite: 38]
    logout()
  }, [logout])

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    timerRef.current = setTimeout(handleTimeout, SESSION_TIMEOUT_MS)
  }, [handleTimeout])

  useEffect(() => {
    // Liste des événements d'activité valide.
    // "mousemove" est volontairement exclu pour éviter de maintenir la session avec un simple mouvement[cite: 33].
    const activityEvents = ['keydown', 'mousedown', 'click', 'touchstart', 'scroll', 'wheel']

    // Initialisation au montage
    resetTimer()

    // Écoute des événements de manière passive pour ne pas impacter les performances de rendu
    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, resetTimer, { passive: true })
    })

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, resetTimer)
      })
    }
  }, [resetTimer])
}
