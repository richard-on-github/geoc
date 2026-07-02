import { Users, ShieldCheck, ClipboardList, Activity } from 'lucide-react'
import { PageHeader } from '@/shared/components/layout/PageHeader'
import { KpiCard } from '../components/KpiCard'
import { DashboardWidgetCard } from '../components/DashboardWidgetCard'
import { useAuthStore, selectUser } from '@/features/auth'
import type { KpiCardData } from '../types'

/**
 * Dashboard GEOC — structure extensible, sans données métier.
 * Les KPIs ci-dessous sont des emplacements neutres (placeholder "—")
 * destinés à être alimentés par les futurs modules (caisses, opérations...).
 * Conformément aux consignes : aucune statistique n'est inventée.
 */
const kpiPlaceholders: KpiCardData[] = [
  { id: 'users', label: 'Utilisateurs actifs', value: '—', icon: Users },
  { id: 'roles', label: 'Rôles configurés', value: '—', icon: ShieldCheck },
  { id: 'audit', label: 'Événements (24h)', value: '—', icon: ClipboardList },
  { id: 'activity', label: 'Activité système', value: '—', icon: Activity },
]

export function DashboardPage() {
  const user = useAuthStore(selectUser)

  return (
    <div>
      <PageHeader
        title="Tableau de bord"
        description={user !== null ? `Bienvenue, ${user.prenom}.` : undefined}
      />

      {/* Grille KPI — extensible, alimentée par les futurs modules métiers */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiPlaceholders.map((kpi) => (
          <KpiCard key={kpi.id} data={kpi} />
        ))}
      </div>

      {/* Widgets — structure prête à accueillir les futurs modules */}
      <div className="grid gap-4 lg:grid-cols-3">
        <DashboardWidgetCard title="Activité récente" span={2}>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Ce widget affichera l'activité récente issue du journal d'audit une fois le module
            connecté aux données réelles.
          </p>
        </DashboardWidgetCard>

        <DashboardWidgetCard title="Accès rapides" span={1}>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Emplacement réservé pour des raccourcis contextuels selon le rôle de l'utilisateur
            connecté.
          </p>
        </DashboardWidgetCard>
      </div>
    </div>
  )
}
