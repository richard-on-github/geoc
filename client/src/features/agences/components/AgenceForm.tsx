import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createAgenceSchema, updateAgenceSchema } from '../schemas'
import type { CreateAgencePayload, UpdateAgencePayload } from '../types'
import { Field } from '@/shared/components/forms/Field'

type FormValues = CreateAgencePayload & Partial<Pick<UpdateAgencePayload, 'actif'>>

interface AgenceFormProps {
  defaultValues?: FormValues
  onSubmit: (data: FormValues) => void
  isSubmitting?: boolean
  submitLabel?: string
  children?: React.ReactNode
}

const inputClass =
  'w-full rounded-[var(--radius)] border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-1 disabled:opacity-50 aria-invalid:border-[hsl(var(--destructive))]'

export function AgenceForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  submitLabel = 'Enregistrer',
  children,
}: AgenceFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(
      defaultValues?.actif !== undefined ? updateAgenceSchema : createAgenceSchema,
    ),
    defaultValues,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field id="nom" label="Nom de l'agence" error={errors.nom?.message}>
          <input
            id="nom"
            type="text"
            autoFocus
            className={inputClass}
            aria-invalid={!!errors.nom}
            disabled={isSubmitting}
            {...register('nom')}
          />
        </Field>
        <Field id="code" label="Code agence" error={errors.code?.message}>
          <input
            id="code"
            type="text"
            className={inputClass}
            aria-invalid={!!errors.code}
            disabled={isSubmitting}
            {...register('code')}
          />
        </Field>
      </div>
      <Field id="adresse" label="Adresse" error={errors.adresse?.message}>
        <input
          id="adresse"
          type="text"
          className={inputClass}
          aria-invalid={!!errors.adresse}
          disabled={isSubmitting}
          {...register('adresse')}
        />
      </Field>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field id="telephone" label="Téléphone" error={errors.telephone?.message}>
          <input
            id="telephone"
            type="tel"
            className={inputClass}
            aria-invalid={!!errors.telephone}
            disabled={isSubmitting}
            {...register('telephone')}
          />
        </Field>
        <Field id="email" label="Email" error={errors.email?.message}>
          <input
            id="email"
            type="email"
            className={inputClass}
            aria-invalid={!!errors.email}
            disabled={isSubmitting}
            {...register('email')}
          />
        </Field>
      </div>

      <div className="flex justify-end gap-3">
        {children}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-[var(--radius)] bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? 'En cours...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
