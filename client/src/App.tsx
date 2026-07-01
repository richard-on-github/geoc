import { RouterProvider } from 'react-router'
import { AppProviders } from '@/app/providers'
import { router } from '@/app/router'
import { ErrorBoundary } from '@/shared/components/feedback/ErrorBoundary'
import '@/styles/tailwind.css'

export function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </ErrorBoundary>
  )
}
