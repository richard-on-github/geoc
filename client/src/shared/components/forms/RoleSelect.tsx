import { forwardRef } from 'react'
import { useAllRoles } from '@/features/security'

interface RoleSelectProps {
  id?: string
  name?: string
  value?: string
  onChange?: React.ChangeEventHandler<HTMLSelectElement>
  onBlur?: React.FocusEventHandler<HTMLSelectElement>
  disabled?: boolean
  'aria-invalid'?: boolean
}

/**
 * Composant métier composé à partir d'un <select> natif stylé,
 * alimenté par la liste des rôles disponibles (useAllRoles).
 */
export const RoleSelect = forwardRef<HTMLSelectElement, RoleSelectProps>(function RoleSelect(
  { disabled, ...props },
  ref,
) {
  // On récupère la réponse de l'API
  const { data: response, isLoading } = useAllRoles()

  // On cible précisément le tableau imbriqué.
  // Selon le wrapping de votre fetcher, il peut être dans response.data.roles ou directement response.roles
  const rolesList = response?.data?.roles ?? response?.roles ?? []

  return (
    <select
      ref={ref}
      disabled={disabled === true || isLoading}
      className="w-full rounded-[var(--radius)] border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-1 focus:outline-none disabled:opacity-50 aria-invalid:border-[hsl(var(--destructive))]"
      {...props}
    >
      <option value="">{isLoading ? 'Chargement des rôles...' : 'Sélectionner un rôle'}</option>

      {rolesList.map((role: any) => (
        <option key={role.id} value={role.id}>
          {/* Remplacement de displayName par nom pour correspondre au backend */}
          {role.nom}
        </option>
      ))}
    </select>
  )
})
