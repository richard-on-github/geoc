import { useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { ArrowLeft, Edit2, Save, X, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// Assure-toi d'importer tes schémas et hooks de mise à jour
import { updateUserSchema, type UpdateUserFormValues } from '../schemas'
import { useUser, useUpdateUser } from '../hooks'

import { UserStatusBadge } from '../components/UserStatusBadge'
import { PageHeader } from '@/shared/components/layout/PageHeader'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { formatDateTime, getInitials } from '@/shared/utils'

// Composants de formulaire réutilisés
import { Field } from '@/shared/components/forms/Field'
import { RoleSelect } from '@/shared/components/forms/RoleSelect'
import { PermissionsSelector } from '@/shared/components/forms/PermissionsSelector'

const inputClass =
  'w-full rounded-[var(--radius)] border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-1 disabled:opacity-50 aria-invalid:border-[hsl(var(--destructive))]'

export function UserDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()

  const [isEditing, setIsEditing] = useState(false)

  const { data: user, isLoading, isError, refetch } = useUser(id)
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    values: user
      ? {
          prenom: user.prenom,
          nom: user.nom,
          email: user.email,
          telephone: user.telephone ?? '',
          roleId: user.role.id,
          permissionIds: user.permissions.map((p) => p.id),
        }
      : undefined,
  })

  const handleCancel = () => {
    reset() // Annule les modifications non sauvegardées
    setIsEditing(false)
  }

  const onSubmit = (data: UpdateUserFormValues) => {
    updateUser(
      { id, payload: data },
      {
        onSuccess: () => {
          setIsEditing(false)
        },
      },
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-[hsl(var(--muted))]" />
        <div className="space-y-4 rounded-lg border border-[hsl(var(--border))] p-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-5 w-full animate-pulse rounded bg-[hsl(var(--muted))]" />
          ))}
        </div>
      </div>
    )
  }

  if (isError || user === undefined) {
    return <ErrorState title="Utilisateur introuvable" onRetry={() => void refetch()} />
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => void navigate('/users')}
        className="mb-4 flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
      >
        <ArrowLeft size={15} aria-hidden="true" />
        Retour à la liste
      </button>

      <PageHeader
        title={user.fullName}
        description={user.email}
        actions={
          <div className="flex items-center gap-3">
            <UserStatusBadge isActive={user.isActive} />
            {!isEditing && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(true)
                }}
                className="flex items-center gap-2 rounded-[var(--radius)] bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] transition-opacity hover:opacity-90"
              >
                <Edit2 size={16} />
                Modifier
              </button>
            )}
          </div>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-3">
        {/* Infos principales ou Formulaire d'édition */}
        <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 lg:col-span-2">
          {!isEditing ? (
            // MODE LECTURE
            <>
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-lg font-bold text-white">
                  {getInitials(user.fullName)}
                </div>
                <div>
                  <h2 className="text-base font-semibold">{user.fullName}</h2>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">{user.email}</p>
                  <p className="mt-0.5 text-sm text-[hsl(var(--muted-foreground))]">
                    {user.role.displayName}
                  </p>
                </div>
              </div>
              <dl className="grid gap-4 text-sm sm:grid-cols-2">
                {[
                  { label: 'Rôle', value: user.role.displayName },
                  { label: 'Téléphone', value: user.telephone ?? 'Non renseigné' },
                  { label: 'Créé le', value: formatDateTime(user.createdAt) },
                  { label: 'Modifié le', value: formatDateTime(user.updatedAt) },
                  {
                    label: 'Dernière connexion',
                    value: user.lastLoginAt !== null ? formatDateTime(user.lastLoginAt) : 'Jamais',
                  },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <dt className="mb-0.5 text-xs font-medium tracking-wider text-[hsl(var(--muted-foreground))] uppercase">
                      {label}
                    </dt>
                    <dd className="text-[hsl(var(--foreground))]">{value}</dd>
                  </div>
                ))}
              </dl>
            </>
          ) : (
            // MODE ÉDITION
            <div className="space-y-4">
              <h2 className="mb-4 text-base font-medium">Modification des informations</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field id="prenom" label="Prénom" error={errors.prenom?.message}>
                  <input
                    id="prenom"
                    type="text"
                    className={inputClass}
                    aria-invalid={!!errors.prenom}
                    disabled={isUpdating}
                    {...register('prenom')}
                  />
                </Field>
                <Field id="nom" label="Nom" error={errors.nom?.message}>
                  <input
                    id="nom"
                    type="text"
                    className={inputClass}
                    aria-invalid={!!errors.nom}
                    disabled={isUpdating}
                    {...register('nom')}
                  />
                </Field>
              </div>
              <Field id="email" label="Adresse email" error={errors.email?.message}>
                <input
                  id="email"
                  type="email"
                  className={inputClass}
                  aria-invalid={!!errors.email}
                  disabled={isUpdating}
                  {...register('email')}
                />
              </Field>
              <Field id="telephone" label="Téléphone (optionnel)" error={errors.telephone?.message}>
                <input
                  id="telephone"
                  type="tel"
                  className={inputClass}
                  aria-invalid={!!errors.telephone}
                  disabled={isUpdating}
                  {...register('telephone')}
                />
              </Field>
              <Field id="roleId" label="Rôle" error={errors.roleId?.message}>
                <RoleSelect
                  id="roleId"
                  className={inputClass}
                  aria-invalid={!!errors.roleId}
                  disabled={isUpdating}
                  {...register('roleId')}
                />
              </Field>
            </div>
          )}
        </div>

        {/* Permissions individuelles */}
        <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
          <h3 className="mb-4 text-sm font-semibold">Permissions individuelles</h3>

          {isEditing ? (
            <PermissionsSelector control={control} name="permissionIds" disabled={isUpdating} />
          ) : user.permissions.length === 0 ? (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Aucune permission individuelle.
            </p>
          ) : (
            <ul className="flex flex-wrap gap-1.5">
              {user.permissions.map((p) => (
                <li
                  key={p.id}
                  className="inline-flex items-center rounded-md border border-[hsl(var(--border))] px-2 py-0.5 font-mono text-xs text-[hsl(var(--muted-foreground))]"
                >
                  {p.nom}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Boutons d'action en mode édition */}
        {isEditing && (
          <div className="mt-4 flex justify-end gap-3 lg:col-span-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isUpdating}
              className="flex items-center gap-2 rounded-[var(--radius)] border border-[hsl(var(--border))] px-4 py-2 text-sm font-medium transition-colors hover:bg-[hsl(var(--muted))]"
            >
              <X size={16} />
              Annuler
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="flex items-center gap-2 rounded-[var(--radius)] bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isUpdating ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        )}
      </form>
    </div>
  )
}
