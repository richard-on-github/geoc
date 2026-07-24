import { useState } from 'react'
import { Loader2, RefreshCw, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/ui/dialog'
import { useResetPassword } from '../hooks'
import type { User } from '../types'

const inputClass =
  'w-full rounded-[var(--radius)] border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-1 disabled:opacity-50 aria-invalid:border-[hsl(var(--destructive))]'

interface ResetPasswordModalProps {
  user: User
  onClose: () => void
}

// Générateur de mot de passe sécurisé (8-12 caractères)
function generatePassword(): string {
  const length = 8 + Math.floor(Math.random() * 5) // 8 à 12
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const digits = '0123456789'
  const symbols = '!@#$%^&*()_+-='
  const all = uppercase + lowercase + digits + symbols

  // Force au moins un de chaque catégorie
  let password = ''
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += digits[Math.floor(Math.random() * digits.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]

  // Remplir le reste aléatoirement
  for (let i = 4; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)]
  }

  // Mélanger la chaîne
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('')
}

export function ResetPasswordModal({ user, onClose }: ResetPasswordModalProps) {
  const [generatedPassword, setGeneratedPassword] = useState(generatePassword)
  const [customPassword, setCustomPassword] = useState('')
  const [useGenerated, setUseGenerated] = useState(true)
  const [copied, setCopied] = useState(false)
  const { mutate: resetPassword, isPending } = useResetPassword()

  const finalPassword = useGenerated ? generatedPassword : customPassword

  const handleGenerateNew = () => {
    setGeneratedPassword(generatePassword())
    setCopied(false)
  }

  const handleCopy = () => {
    if (finalPassword) {
      navigator.clipboard.writeText(finalPassword)
      setCopied(true)
      setTimeout(() => { setCopied(false); }, 2000)
    }
  }

  const handleSubmit = () => {
    if (!finalPassword || finalPassword.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    resetPassword({ userId: user.id, newPassword: finalPassword }, { onSuccess: onClose })
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Réinitialiser le mot de passe</DialogTitle>
          <DialogDescription>
            Réinitialiser le mot de passe de <strong>{user.fullName}</strong> ({user.email})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-2">
            <input
              type="radio"
              id="useGenerated"
              checked={useGenerated}
              onChange={() => { setUseGenerated(true); }}
              className="h-4 w-4 accent-[hsl(var(--primary))]"
            />
            <label htmlFor="useGenerated" className="cursor-pointer text-sm">
              Utiliser un mot de passe généré
            </label>
          </div>

          {useGenerated && (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={generatedPassword}
                readOnly
                className={`${inputClass} flex-1 font-mono`}
              />
              <button
                type="button"
                onClick={handleGenerateNew}
                className="rounded-[var(--radius)] border border-[hsl(var(--border))] px-3 py-2 transition-colors hover:bg-[hsl(var(--muted))]"
                title="Générer un nouveau mot de passe"
              >
                <RefreshCw size={16} />
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="rounded-[var(--radius)] border border-[hsl(var(--border))] px-3 py-2 transition-colors hover:bg-[hsl(var(--muted))]"
                title="Copier le mot de passe"
              >
                {copied ? (
                  <Check size={16} className="text-[hsl(var(--success))]" />
                ) : (
                  <Copy size={16} />
                )}
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="radio"
              id="useCustom"
              checked={!useGenerated}
              onChange={() => { setUseGenerated(false); }}
              className="h-4 w-4 accent-[hsl(var(--primary))]"
            />
            <label htmlFor="useCustom" className="cursor-pointer text-sm">
              Saisir manuellement
            </label>
          </div>

          {!useGenerated && (
            <input
              type="text"
              placeholder="Entrez un nouveau mot de passe (min. 8 caractères)"
              value={customPassword}
              onChange={(e) => { setCustomPassword(e.target.value); }}
              className={inputClass}
            />
          )}

          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un
            chiffre et un symbole.
          </p>
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-[var(--radius)] border border-[hsl(var(--border))] px-4 py-2 text-sm font-medium transition-colors hover:bg-[hsl(var(--muted))] disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || !finalPassword || finalPassword.length < 8}
            className="flex items-center gap-2 rounded-[var(--radius)] bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isPending && <Loader2 size={16} className="animate-spin" />}
            {isPending ? 'Réinitialisation...' : 'Réinitialiser'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
