import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, X } from 'lucide-react'
import { createRoleSchema, updateRoleSchema } from '../schemas'
import type { CreateRoleFormValues, UpdateRoleFormValues } from '../schemas'
import { useCreateRole, useUpdateRole, useAllPermissions } from '../hooks'
import { PermissionMatrix } from './PermissionMatrix'
import { PageLoader } from '@/shared/components/feedback/PageLoader'
import type { Role } from '../types'

type FormMode = 'create' | 'edit'

interface RoleFormModalProps {
  mode: FormMode
  role?: Role
  onClose: () => void
}

type FormValues = CreateRoleFormValues | UpdateRoleFormValues

const inputClass =
  'w-full rounded-[var(--radius)] border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-1 disabled:opacity-50 aria-invalid:border-[hsl(var(--destructive))]'

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-[hsl(var(--foreground))]">
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="text-xs text-[hsl(var(--destructive))]">
          {error}
        </p>
      )}
    </div>
  )
}

export function RoleFormModal({ mode, role, onClose }: RoleFormModalProps) {
  const { data: permissions = [], isLoading: loadingPerms } = useAllPermissions()
  const { mutate: createRole, isPending: creating } = useCreateRole()
  const { mutate: updateRole, isPending: updating } = useUpdateRole(role?.id ?? '')
  const isPending = creating || updating

  const schema = mode === 'create' ? createRoleSchema : updateRoleSchema

  const defaultValues =
    mode === 'edit' && role
      ? {
          nom: role.nom,
          code: role.code,
          description: role.description ?? '',
          actif: role.actif,
          permissionIds: role.permissions.map((p) => p.id),
        }
      : {
          nom: '',
          code: '',
          description: '',
          permissionIds: [],
        }

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  useEffect(() => {
    if (mode === 'edit' && role) {
      reset({
        nom: role.nom,
        code: role.code,
        description: role.description ?? '',
        actif: role.actif,
        permissionIds: role.permissions.map((p) => p.id),
      })
    }
  }, [mode, role, reset])

  const onSubmit = (values: FormValues) => {
    if (mode === 'create') {
      createRole(values as CreateRoleFormValues, { onSuccess: onClose })
    } else {
      updateRole(values, { onSuccess: onClose })
    }
  }

  const title = mode === 'create' ? 'Créer un rôle' : `Modifier — ${role?.nom ?? ''}`
  const formErrors = errors as Record<string, { message?: string }>

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="role-form-title"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-16"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-6 py-4">
          <h2 id="role-form-title" className="text-base font-semibold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-md p-1.5 text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted))]"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="max-h-[70vh] space-y-5 overflow-y-auto p-6">
            {/* Champs communs */}
            <Field id="nom" label="Nom du rôle" error={formErrors['nom']?.message}>
              <input
                id="nom"
                type="text"
                autoFocus={mode === 'create'}
                aria-invalid={!!formErrors['nom']}
                className={inputClass}
                disabled={isPending}
                placeholder="ex: Chef Comptable"
                {...register('nom')}
              />
            </Field>

            <Field id="code" label="Code unique" error={formErrors['code']?.message}>
              <input
                id="code"
                type="text"
                aria-invalid={!!formErrors['code']}
                className={inputClass}
                disabled={isPending}
                placeholder="ex: CHEF_COMPTABLE"
                {...register('code')}
              />
            </Field>

            {mode === 'edit' && (
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="actif"
                  {...register('actif')}
                  disabled={isPending}
                  className="h-4 w-4 rounded border-[hsl(var(--border))] accent-[hsl(var(--primary))]"
                />
                <label htmlFor="actif" className="text-sm text-[hsl(var(--foreground))]">
                  Actif
                </label>
              </div>
            )}

            <Field
              id="description"
              label="Description (optionnelle)"
              error={formErrors['description']?.message}
            >
              <textarea
                id="description"
                rows={2}
                aria-invalid={!!formErrors['description']}
                className={`${inputClass} resize-none`}
                disabled={isPending}
                placeholder="Décrivez les responsabilités de ce rôle..."
                {...register('description')}
              />
            </Field>

            {/* Permissions */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                Permissions
                {formErrors['permissionIds'] && (
                  <span className="ml-2 text-xs font-normal text-[hsl(var(--destructive))]">
                    {formErrors['permissionIds'].message}
                  </span>
                )}
              </p>
              {loadingPerms ? (
                <PageLoader />
              ) : (
                <Controller
                  name="permissionIds"
                  control={control}
                  render={({ field }) => (
                    <PermissionMatrix
                      permissions={permissions}
                      selected={field.value}
                      onChange={field.onChange}
                      disabled={isPending}
                    />
                  )}
                />
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t border-[hsl(var(--border))] px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-[var(--radius)] border border-[hsl(var(--border))] px-4 py-2 text-sm font-medium transition-colors hover:bg-[hsl(var(--muted))] disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isPending || loadingPerms}
              className="flex items-center gap-2 rounded-[var(--radius)] bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
              {isPending
                ? mode === 'create'
                  ? 'Création...'
                  : 'Modification...'
                : mode === 'create'
                  ? 'Créer le rôle'
                  : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
