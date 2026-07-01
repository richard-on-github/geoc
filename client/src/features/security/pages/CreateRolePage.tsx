import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { createRoleSchema, type CreateRoleFormValues } from '../schemas'
import { useCreateRole, useAllPermissions } from '../hooks'
import { PermissionMatrix } from '../components/PermissionMatrix'
import { PageLoader } from '@/shared/components/feedback/PageLoader'
import { Field } from '@/shared/components/forms/Field'

const inputClass =
  'w-full rounded-[var(--radius)] border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-1 disabled:opacity-50 aria-invalid:border-[hsl(var(--destructive))]'

export function CreateRolePage() {
  const navigate = useNavigate()
  const { mutate: createRole, isPending } = useCreateRole()
  const { data: permissions = [], isLoading: loadingPerms } = useAllPermissions()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateRoleFormValues>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      permissionIds: [],
      nom: '',
      code: '',
      description: '',
    },
  })

  const onSubmit = (values: CreateRoleFormValues) => {
    createRole(values, {
      onSuccess: () => navigate('/security/roles'),
    })
  }

  return (
    <div className="container mx-auto max-w-4xl py-6">
      <button
        type="button"
        onClick={() => navigate('/security/roles')}
        className="mb-4 flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
      >
        <ArrowLeft size={15} aria-hidden="true" />
        Retour à la liste
      </button>

      <h1 className="mb-6 text-2xl font-semibold">Créer un rôle</h1>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        <div className="space-y-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
          <h2 className="text-base font-medium">Informations du rôle</h2>

          <Field id="nom" label="Nom du rôle" error={errors.nom?.message}>
            <input
              id="nom"
              type="text"
              autoFocus
              aria-invalid={!!errors.nom}
              className={inputClass}
              disabled={isPending}
              placeholder="ex: Chef Comptable"
              {...register('nom')}
            />
          </Field>

          <Field id="code" label="Code unique" error={errors.code?.message}>
            <input
              id="code"
              type="text"
              aria-invalid={!!errors.code}
              className={inputClass}
              disabled={isPending}
              placeholder="ex: CHEF_COMPTABLE"
              {...register('code')}
            />
          </Field>

          <Field
            id="description"
            label="Description (optionnelle)"
            error={errors.description?.message}
          >
            <textarea
              id="description"
              rows={2}
              aria-invalid={!!errors.description}
              className={`${inputClass} resize-none`}
              disabled={isPending}
              placeholder="Décrivez les responsabilités de ce rôle..."
              {...register('description')}
            />
          </Field>
        </div>

        <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
          <div className="mb-4">
            <h2 className="text-base font-medium">Permissions</h2>
            {errors.permissionIds && (
              <p className="mt-1 text-xs text-[hsl(var(--destructive))]">
                {errors.permissionIds.message}
              </p>
            )}
          </div>
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

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/security/roles')}
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
            {isPending ? 'Création...' : 'Créer le rôle'}
          </button>
        </div>
      </form>
    </div>
  )
}
