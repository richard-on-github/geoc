import { Outlet } from 'react-router'
import { Sidebar } from './components/sidebar/Sidebar'
import { Topbar } from './components/topbar/Topbar'
import { useActivityTimeout } from '@/features/auth/hooks/useActivityTimeout'

export function DashboardLayout() {
  useActivityTimeout()
  return (
    <div className="flex h-screen overflow-hidden bg-[hsl(var(--background))]">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Zone principale */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />

        {/* Contenu de la page */}
        <main className="flex-1 overflow-y-auto p-6" id="main-content" role="main">
          <div className="mx-auto max-w-[var(--content-max-width)]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
