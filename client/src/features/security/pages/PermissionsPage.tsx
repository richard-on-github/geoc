import { PageHeader } from '@/shared/components/layout/PageHeader'
import { PermissionMatrix } from '../components/PermissionMatrix'
import { PageLoader } from '@/shared/components/feedback/PageLoader'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { useAllPermissions } from '../hooks'

/**
 * Module de consultation des permissions — volontairement léger.
 * Les permissions sont définies côté backend (seed Prisma) ;
 * cette page sert uniquement de référentiel consultable en lecture seule.
 */
export function PermissionsPage() {
  const { data: permissions, isLoading, isError, refetch } = useAllPermissions()
  console.warn(permissions)

  return (
    <div>
      <PageHeader
        title="Permissions"
        description="Référentiel des permissions disponibles dans le système"
      />

      {isLoading && <PageLoader />}

      {isError && (
        <ErrorState title="Impossible de charger les permissions" onRetry={() => void refetch()} />
      )}

      {permissions !== undefined && !isLoading && !isError && (
        <PermissionMatrix
          permissions={permissions}
          selected={permissions.map((p) => p.id)}
          onChange={() => void 0}
          readonly
        />
      )}
    </div>
  )
}
