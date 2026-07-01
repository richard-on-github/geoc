import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { resetPasswordRequestSchema, type ResetPasswordRequestFormValues } from '../schemas'
import { authApi } from '../api'
import { ApiError } from '@/shared/types'

export function ResetPasswordRequestForm() {
  const [isSuccess, setIsSuccess] = useState(false)

  const { mutate, isPending } = useMutation({
    mutationFn: authApi.requestPasswordReset,
    onSuccess: () => setIsSuccess(true),
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message)
        return
      }
      toast.error('Une erreur est survenue. Veuillez réessayer.')
    },
  })

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordRequestFormValues>({
    resolver: zodResolver(resetPasswordRequestSchema),
  })

  if (isSuccess) {
    return (
      <div className="space-y-4 text-center">
        <CheckCircle2 className="mx-auto text-[hsl(var(--primary))]" size={40} />
        <div>
          <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">
            Email envoyé
          </h2>
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
            Si cette adresse est associée à un compte, vous recevrez un lien de réinitialisation
            dans quelques minutes.
          </p>
        </div>
        <a
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--primary))] hover:underline"
        >
          <ArrowLeft size={14} />
          Retour à la connexion
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit((v) => mutate(v))} noValidate className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">
          Mot de passe oublié
        </h2>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          Saisissez votre email pour recevoir un lien de réinitialisation.
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-sm font-medium text-[hsl(var(--foreground))]">
          Adresse email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          autoFocus
          aria-invalid={errors.email !== undefined}
          disabled={isPending}
          className="w-full rounded-[var(--radius)] border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-1 disabled:opacity-50 aria-invalid:border-[hsl(var(--destructive))]"
          placeholder="exemple@lonato.tg"
          {...register('email')}
        />
        {errors.email && (
          <p role="alert" className="text-xs text-[hsl(var(--destructive))]">
            {errors.email.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 rounded-[var(--radius)] bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-medium text-[hsl(var(--primary-foreground))] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isPending && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
        {isPending ? 'Envoi...' : 'Envoyer le lien'}
      </button>

      <div className="text-center">
        <a
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
        >
          <ArrowLeft size={14} />
          Retour à la connexion
        </a>
      </div>
    </form>
  )
}
