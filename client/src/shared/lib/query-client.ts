import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,       // 5 minutes — données considérées fraîches
      gcTime: 1000 * 60 * 30,          // 30 minutes — durée de vie en cache
      retry: (failureCount, error) => {
        // Ne pas retry sur les erreurs 4xx (sauf 429)
        if (error instanceof Error && 'status' in error) {
          const status = (error as { status: number }).status
          if (status >= 400 && status < 500 && status !== 429) return false
        }
        return failureCount < 2
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false,
    },
  },
})
