import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ShieldPlus } from 'lucide-react'
import { PageHeader } from '@/shared/components/layout/PageHeader'
import { Can } from '@/shared/components/navigation/Can'
import { RolesGrid } from '../components/RolesGrid'
import { RoleFormModal } from '../components/RoleFormModal'
import { DeleteRoleDialog } from '../components/DeleteRoleDialog'
import type { Role } from '../types'

export function RolesListPage() {
  const navigate = useNavigate()
  const [roleToEdit, setRoleToEdit] = useState<Role | null>(null)
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null)

  const handleViewDetail = (id: string) => {
    navigate(`/security/roles/${id}`)
  }

  return (
    <div>
      <PageHeader
        title="Rôles"
        description="Gestion des rôles et de leurs permissions"
        actions={
          <Can permission="role.create">
            <button
              type="button"
              onClick={() => navigate('/security/roles/new')}
              className="flex items-center gap-2 rounded-[var(--radius)] bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] transition-opacity hover:opacity-90"
            >
              <ShieldPlus size={16} aria-hidden="true" />
              Nouveau rôle
            </button>
          </Can>
        }
      />

      <RolesGrid
        onEdit={setRoleToEdit}
        onDelete={setRoleToDelete}
        onViewDetail={handleViewDetail}
      />

      {roleToEdit && (
        <RoleFormModal
          mode="edit"
          role={roleToEdit}
          onClose={() => {
            setRoleToEdit(null)
          }}
        />
      )}
      {roleToDelete && (
        <DeleteRoleDialog
          role={roleToDelete}
          onClose={() => {
            setRoleToDelete(null)
          }}
        />
      )}
    </div>
  )
}
