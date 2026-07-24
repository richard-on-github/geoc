import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { changePasswordFormSchema, type ChangePasswordFormValues } from '../schemas'
import { useChangePassword } from '../hooks'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/ui/dialog'
import { Field } from '@/shared/components/forms/Field'
import { Loader2 } from 'lucide-react'

const inputClass =
  'w-full rounded-[var(--radius)] border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-1 disabled:opacity-50 aria-invalid:border-[hsl(var(--destructive))]'

interface ChangePasswordModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChangePasswordModal({ open, onOpenChange }: ChangePasswordModalProps) {
  const { mutate: changePassword, isPending } = useChangePassword()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onSubmit = (values: ChangePasswordFormValues) => {
    changePassword(
      { currentPassword: values.currentPassword, newPassword: values.newPassword },
      {
        onSuccess: () => {
          reset() // Vide le formulaire
          onOpenChange(false) // Ferme le modal après un succès
        },
      },
    )
  }

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    reset()
    onOpenChange(false)
  }

  // Fermeture si on clique en dehors du modal ou sur la croix (via Radix UI)
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      reset()
    }
    onOpenChange(isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Changer le mot de passe</DialogTitle>
          <DialogDescription>
            Saisissez votre mot de passe actuel et le nouveau mot de passe.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-4 py-2">
            <Field
              id="currentPassword"
              label="Mot de passe actuel"
              error={errors.currentPassword?.message}
            >
              <input
                id="currentPassword"
                type="password"
                className={inputClass}
                aria-invalid={!!errors.currentPassword}
                disabled={isPending}
                {...register('currentPassword')}
              />
            </Field>
            <Field
              id="newPassword"
              label="Nouveau mot de passe"
              error={errors.newPassword?.message}
            >
              <input
                id="newPassword"
                type="password"
                className={inputClass}
                aria-invalid={!!errors.newPassword}
                disabled={isPending}
                {...register('newPassword')}
              />
            </Field>
            <Field
              id="confirmPassword"
              label="Confirmer le mot de passe"
              error={errors.confirmPassword?.message}
            >
              <input
                id="confirmPassword"
                type="password"
                className={inputClass}
                aria-invalid={!!errors.confirmPassword}
                disabled={isPending}
                {...register('confirmPassword')}
              />
            </Field>
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isPending}
              className="rounded-[var(--radius)] border border-[hsl(var(--border))] px-4 py-2 text-sm font-medium transition-colors hover:bg-[hsl(var(--muted))] disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 rounded-[var(--radius)] bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isPending && <Loader2 size={16} className="animate-spin" />}
              {isPending ? 'Modification...' : 'Modifier'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
