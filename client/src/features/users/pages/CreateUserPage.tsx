import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { createUserSchema, type CreateUserFormValues } from '../schemas'
import { useCreateUser } from '../hooks'
import { RoleSelect } from '@/shared/components/forms/RoleSelect'
import { PermissionsSelector } from '@/shared/components/forms/PermissionsSelector'
import { Field } from '@/shared/components/forms/Field'

// Classe CSS commune pour les champs de formulaire
const inputClass =
  'w-full rounded-[var(--radius)] border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-1 disabled:opacity-50 aria-invalid:border-[hsl(var(--destructive))]'

export function CreateUserPage() {
  const navigate = useNavigate()
  const { mutate: create, isPending } = useCreateUser()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      permissionIds: [],
    },
  })

  const onSubmit = (values: CreateUserFormValues) => {
    create(values, {
      onSuccess: () => navigate('/users'),
    })
  }

  return (
    <div className="container mx-auto max-w-4xl py-6">
      <button
        type="button"
        onClick={() => navigate('/users')}
        className="mb-4 flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
      >
        <ArrowLeft size={15} aria-hidden="true" />
        Retour à la liste
      </button>

      <h1 className="mb-6 text-2xl font-semibold">Créer un utilisateur</h1>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        {/* Informations générales */}
        <div className="space-y-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
          <h2 className="text-base font-medium">Informations personnelles</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field id="prenom" label="Prénom" error={errors.prenom?.message}>
              <input
                id="prenom"
                type="text"
                autoFocus
                className={inputClass}
                aria-invalid={!!errors.prenom}
                disabled={isPending}
                {...register('prenom')}
              />
            </Field>
            <Field id="nom" label="Nom" error={errors.nom?.message}>
              <input
                id="nom"
                type="text"
                className={inputClass}
                aria-invalid={!!errors.nom}
                disabled={isPending}
                {...register('nom')}
              />
            </Field>
          </div>
          <Field id="email" label="Adresse email" error={errors.email?.message}>
            <input
              id="email"
              type="email"
              autoComplete="off"
              className={inputClass}
              aria-invalid={!!errors.email}
              disabled={isPending}
              {...register('email')}
            />
          </Field>
          <Field id="telephone" label="Téléphone (optionnel)" error={errors.telephone?.message}>
            <input
              id="telephone"
              type="tel"
              className={inputClass}
              aria-invalid={!!errors.telephone}
              disabled={isPending}
              {...register('telephone')}
            />
          </Field>
          <Field id="roleId" label="Rôle" error={errors.roleId?.message}>
            <RoleSelect
              id="roleId"
              className={inputClass}
              aria-invalid={!!errors.roleId}
              disabled={isPending}
              {...register('roleId')}
            />
          </Field>
          <Field id="password" label="Mot de passe temporaire" error={errors.password?.message}>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              className={inputClass}
              aria-invalid={!!errors.password}
              disabled={isPending}
              {...register('password')}
            />
          </Field>
        </div>

        {/* Sélecteur de permissions par module */}
        <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
          <h2 className="mb-4 text-base font-medium">Permissions individuelles</h2>
          <PermissionsSelector control={control} name="permissionIds" disabled={isPending} />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/users')}
            disabled={isPending}
            className="rounded-[var(--radius)] border border-[hsl(var(--border))] px-4 py-2 text-sm font-medium transition-colors hover:bg-[hsl(var(--muted))] disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 rounded-[var(--radius)] bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
            {isPending ? 'Création...' : 'Créer'}
          </button>
        </div>
      </form>
    </div>
  )
}
