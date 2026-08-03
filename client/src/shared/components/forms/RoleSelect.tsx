import { forwardRef, type ChangeEventHandler, type FocusEventHandler } from 'react'
import { useAllRoles, type Role } from '@/features/security'

interface RoleSelectProps {
  id?: string
  name?: string
  value?: string
  onChange?: ChangeEventHandler<HTMLSelectElement>
  onBlur?: FocusEventHandler<HTMLSelectElement>
  disabled?: boolean
  'aria-invalid'?: boolean
}

type RoleOption = Pick<Role, 'id' | 'nom'>

type RolesApiResponse =
  | Role[]
  | {
      data?: {
        roles?: RoleOption[]
      }
      roles?: RoleOption[]
    }

export const RoleSelect = forwardRef<HTMLSelectElement, RoleSelectProps>(function RoleSelect(
  { disabled, ...props },
  ref,
) {
  const { data: response, isLoading } = useAllRoles()

  const payload = response as RolesApiResponse | undefined
  const rolesList: RoleOption[] = Array.isArray(payload)
    ? payload
    : (payload?.data?.roles ?? payload?.roles ?? [])

  return (
    <>
      <select
        ref={ref}
        disabled={disabled === true || isLoading}
        className="w-full rounded-(--radius) border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-1 focus:outline-none disabled:opacity-50 aria-invalid:border-[hsl(var(--destructive))]"
        {...props}
      >
        <option value="">{isLoading ? 'Chargement des rôles...' : 'Sélectionner un rôle'}</option>

        {rolesList.map((role) => {
          const label =
            typeof role.nom === 'string' && role.nom.trim() !== '' ? role.nom : `Rôle ${role.id}`

          return (
            <option key={role.id} value={role.id}>
              {label}
            </option>
          )
        })}
      </select>
    </>
  )
})
