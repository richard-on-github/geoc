import type { ReactNode } from 'react'
import { QueryProvider } from './QueryProvider'
import { ToastProvider } from './ToastProvider'
import { AuthInitializer } from './AuthInitializer'

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryProvider>
      <AuthInitializer>
        {children}
      </AuthInitializer>
      <ToastProvider />
    </QueryProvider>
  )
}
