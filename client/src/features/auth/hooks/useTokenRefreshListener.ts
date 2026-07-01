import { useEffect } from 'react'
import { useAuthStore } from './useAuthStore'

/**
 * Synchronise le store Zustand quand l'interceptor Axios
 * rafraîchit silencieusement l'access token.
 * À monter une seule fois dans AppProviders.
 */
export function useTokenRefreshListener() {
  const { updateAccessToken } = useAuthStore()

  useEffect(() => {
    function handleTokenRefreshed(event: Event) {
      const customEvent = event as CustomEvent<{ accessToken: string }>
      updateAccessToken(customEvent.detail.accessToken)
    }

    window.addEventListener('geoc:token-refreshed', handleTokenRefreshed)
    return () => {
      window.removeEventListener('geoc:token-refreshed', handleTokenRefreshed)
    }
  }, [updateAccessToken])
}
