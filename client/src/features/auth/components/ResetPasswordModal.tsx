import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/ui/dialog'
import { Field } from '@/shared/components/forms/Field'
import { useResetPassword } from '@/features/auth/hooks/useAuthMutations'
import type { User } from '../types'
import { Loader2 } from 'lucide-react'

const resetPasswordFormSchema = z
  .object({
    newPassword: z.string().min(8, 'Minimum 8 caractères'),
    confirmPassword: z.string().min(8, 'Confirmation requise'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })

type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>

interface ResetPasswordModalProps {
  open: boolean
  user: User | null
  onOpenChange: (open: boolean) => void
}

const inputClass =
  'w-full rounded-[var(--radius)] border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-1 disabled:opacity-50 aria-invalid:border-[hsl(var(--destructive))]'

export function ResetPasswordModal({ open, user, onOpenChange }: ResetPasswordModalProps) {
  const { mutate: resetPassword, isPending } = useResetPassword()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onSubmit = (data: ResetPasswordFormValues) => {
    if (!user) return
    resetPassword(
      { userId: user.id, newPassword: data.newPassword },
      {
        onSuccess: () => {
          reset()
          onOpenChange(false)
        },
      },
    )
  }

  const handleClose = () => {
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Réinitialiser le mot de passe</DialogTitle>
          <DialogDescription>
            {user && (
              <>
                Vous allez réinitialiser le mot de passe de <strong>{user.fullName}</strong> (
                {user.email}). Un nouveau mot de passe temporaire sera défini.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field id="newPassword" label="Nouveau mot de passe" error={errors.newPassword?.message}>
            <input
              id="newPassword"
              type="password"
              className={inputClass}
              disabled={isPending}
              {...register('newPassword')}
            />
          </Field>
          <Field
            id="confirmPassword"
            label="Confirmer le nouveau mot de passe"
            error={errors.confirmPassword?.message}
          >
            <input
              id="confirmPassword"
              type="password"
              className={inputClass}
              disabled={isPending}
              {...register('confirmPassword')}
            />
          </Field>
          <DialogFooter>
            <button
              type="button"
              onClick={handleClose}
              disabled={isPending}
              className="rounded-[var(--radius)] border border-[hsl(var(--border))] px-4 py-2 text-sm font-medium transition-colors hover:bg-[hsl(var(--muted))]"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 rounded-[var(--radius)] bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isPending && <Loader2 size={16} className="animate-spin" />}
              {isPending ? 'Réinitialisation...' : 'Réinitialiser'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
