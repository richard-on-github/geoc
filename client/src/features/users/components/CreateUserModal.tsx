
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, X } from 'lucide-react'
import { createUserSchema, type CreateUserFormValues } from '../schemas'
import { useCreateUser } from '../hooks'
import { RoleSelect } from '@/shared/components/forms/RoleSelect'

interface CreateUserModalProps {
  onClose: () => void
}

/* Champ de formulaire réutilisable en interne */
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
      {error !== undefined && (
        <p role="alert" className="text-xs text-[hsl(var(--destructive))]">
          {error}
        </p>
      )}
    </div>
  )
}

const inputClass =
  'w-full rounded-[var(--radius)] border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-1 disabled:opacity-50 aria-invalid:border-[hsl(var(--destructive))]'

export function CreateUserModal({ onClose }: CreateUserModalProps) {
  const { mutate: create, isPending } = useCreateUser()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
  })

  const onSubmit = (values: CreateUserFormValues) => {
    create(values, { onSuccess: onClose })
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-user-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-lg rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-6 py-4">
          <h2 id="create-user-title" className="text-base font-semibold">
            Créer un utilisateur
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
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 p-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Remplacé firstName par prenom */}
            <Field id="prenom" label="Prénom" error={errors.prenom?.message}>
              <input
                id="prenom"
                type="text"
                autoFocus
                aria-invalid={!!errors.prenom}
                className={inputClass}
                disabled={isPending}
                {...register('prenom')}
              />
            </Field>
            {/* Remplacé lastName par nom */}
            <Field id="nom" label="Nom" error={errors.nom?.message}>
              <input
                id="nom"
                type="text"
                aria-invalid={!!errors.nom}
                className={inputClass}
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
              aria-invalid={!!errors.email}
              className={inputClass}
              disabled={isPending}
              {...register('email')}
            />
          </Field>

          {/* Ajout du champ téléphone (optionnel selon votre schéma) */}
          <Field id="telephone" label="Téléphone (optionnel)" error={errors.telephone?.message}>
            <input
              id="telephone"
              type="tel"
              autoComplete="off"
              aria-invalid={!!errors.telephone}
              className={inputClass}
              disabled={isPending}
              {...register('telephone')}
            />
          </Field>

          <Field id="roleId" label="Rôle" error={errors.roleId?.message}>
            <RoleSelect
              id="roleId"
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
              aria-invalid={!!errors.password}
              className={inputClass}
              disabled={isPending}
              {...register('password')}
            />
          </Field>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2">
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
              disabled={isPending}
              className="flex items-center gap-2 rounded-[var(--radius)] bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
              {isPending ? 'Création...' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
