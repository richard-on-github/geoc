import { Outlet } from 'react-router'
import { Sidebar } from './components/sidebar/Sidebar'
import { Topbar } from './components/topbar/Topbar'

/**
 * Layout principal de GEOC.
 * Structure : Sidebar fixe + zone principale (Topbar + contenu).
 * La sidebar gère sa propre logique de collapse via le sidebarStore.
 */
export function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-[hsl(var(--background))]">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Zone principale */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />

        {/* Contenu de la page */}
        <main
          className="flex-1 overflow-y-auto p-6"
          id="main-content"
          role="main"
        >
          <div className="mx-auto max-w-[var(--content-max-width)]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
