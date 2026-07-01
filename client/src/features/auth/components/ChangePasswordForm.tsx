import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { changePasswordSchema, type ChangePasswordFormValues } from '../schemas'
import { useChangePassword } from '../hooks'

interface ChangePasswordFormProps {
  onSuccess?: () => void
}

export function ChangePasswordForm({ onSuccess }: ChangePasswordFormProps) {
  const [show, setShow] = useState({ current: false, next: false, confirm: false })
  const { mutate, isPending } = useChangePassword()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  })

  const onSubmit = (values: ChangePasswordFormValues) => {
    mutate(values, {
      onSuccess: () => {
        reset()
        onSuccess?.()
      },
    })
  }

  const toggle = (field: keyof typeof show) => {
    setShow((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const fields = [
    {
      key: 'current' as const,
      id: 'currentPassword',
      label: 'Mot de passe actuel',
      autoComplete: 'current-password',
      registration: register('currentPassword'),
      error: errors.currentPassword,
    },
    {
      key: 'next' as const,
      id: 'newPassword',
      label: 'Nouveau mot de passe',
      autoComplete: 'new-password',
      registration: register('newPassword'),
      error: errors.newPassword,
    },
    {
      key: 'confirm' as const,
      id: 'confirmPassword',
      label: 'Confirmer le nouveau mot de passe',
      autoComplete: 'new-password',
      registration: register('confirmPassword'),
      error: errors.confirmPassword,
    },
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {fields.map(({ key, id, label, autoComplete, registration, error }) => (
        <div key={id} className="space-y-1.5">
          <label htmlFor={id} className="block text-sm font-medium text-[hsl(var(--foreground))]">
            {label}
          </label>
          <div className="relative">
            <input
              id={id}
              type={show[key] ? 'text' : 'password'}
              autoComplete={autoComplete}
              aria-invalid={error !== undefined}
              disabled={isPending}
              className="w-full rounded-[var(--radius)] border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 pr-10 text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-1 disabled:opacity-50 aria-invalid:border-[hsl(var(--destructive))]"
              {...registration}
            />
            <button
              type="button"
              aria-label={show[key] ? 'Masquer' : 'Afficher'}
              onClick={() => toggle(key)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            >
              {show[key] ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {error && (
            <p role="alert" className="text-xs text-[hsl(var(--destructive))]">
              {error.message}
            </p>
          )}
        </div>
      ))}

      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 rounded-[var(--radius)] bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-medium text-[hsl(var(--primary-foreground))] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
      >
        {isPending && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
        {isPending ? 'Modification...' : 'Modifier le mot de passe'}
      </button>
    </form>
  )
}
