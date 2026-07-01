import { useState } from 'react'
import { PageHeader } from '@/shared/components/layout/PageHeader'
import { AuditFilters } from '../components/AuditFilters'
import { AuditTable } from '../components/AuditTable'
import type { AuditLogFilters } from '../types'

export function AuditLogPage() {
  const [filters, setFilters] = useState<AuditLogFilters>({})

  return (
    <div>
      <PageHeader
        title="Journal d'audit"
        description="Historique des actions effectuées sur la plateforme"
      />
      <AuditFilters filters={filters} onChange={setFilters} />
      <AuditTable filters={filters} />
    </div>
  )
}
