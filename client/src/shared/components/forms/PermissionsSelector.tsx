import { useAllPermissions } from '@/features/security/hooks/useSecurity'
import { Controller, type Control } from 'react-hook-form'
import { Loader2 } from 'lucide-react'
import type { Permission } from '@/features/security/types'

interface PermissionsSelectorProps {
  control: Control<any>
  name: string
  disabled?: boolean
}

export function PermissionsSelector({ control, name, disabled }: PermissionsSelectorProps) {
  const { data: permissions, isLoading, isError } = useAllPermissions()

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
        <Loader2 size={16} className="animate-spin" />
        Chargement des permissions...
      </div>
    )
  }

  if (isError || !permissions || permissions.length === 0) {
    return (
      <p className="text-sm text-[hsl(var(--destructive))]">
        {isError ? 'Erreur lors du chargement des permissions.' : 'Aucune permission disponible.'}
      </p>
    )
  }

  // Grouper par resource (module)
  const grouped = permissions.reduce<Record<string, Permission[]>>(
    (acc, perm) => {
      const module = perm.resource || 'Autres'
      if (!acc[module]) acc[module] = []
      acc[module].push(perm)
      return acc
    },
    {},
  )

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange } }) => (
        <div className="space-y-4">
          {Object.entries(grouped).map(([module, perms]) => (
            <div key={module}>
              <h3 className="mb-2 text-sm font-medium capitalize text-[hsl(var(--foreground))]">
                {module}
              </h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {perms.map((perm) => {
                  const isChecked = (value as string[]).includes(perm.id)
                  return (
                    <label
                      key={perm.id}
                      className="flex cursor-pointer items-start gap-2 text-sm text-[hsl(var(--foreground))]"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={disabled}
                        onChange={(e) => {
                          const checked = e.target.checked
                          const newValue = checked
                            ? [...(value as string[]), perm.id]
                            : (value as string[]).filter((id) => id !== perm.id)
                          onChange(newValue)
                        }}
                        className="mt-0.5 h-4 w-4 rounded border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-[hsl(var(--ring))] focus:ring-offset-1"
                      />
                      <span>{perm.nom}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    />
  )
}
