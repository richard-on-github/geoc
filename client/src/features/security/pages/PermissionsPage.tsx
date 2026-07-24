import { PageHeader } from '@/shared/components/layout/PageHeader'
import { PermissionMatrix } from '../components/PermissionMatrix'
import { PageLoader } from '@/shared/components/feedback/PageLoader'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { useAllPermissions } from '../hooks'

export function PermissionsPage() {
  const { data: permissions, isLoading, isError, refetch } = useAllPermissions()

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
