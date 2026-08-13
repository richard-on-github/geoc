import { useState } from 'react'
import { Mail, X, Plus, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Can } from '@/shared/components/navigation/Can'
import {
  useEmailsAutorises,
  useAjouterEmailAutorise,
  useSupprimerEmailAutorise,
} from '../hooks/useEmailsAutorises'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function EmailsAutorisesButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Can permission="vente.email.manage">
      <button
        type="button"
        onClick={() => {
          setIsOpen(true)
        }}
        className="flex items-center gap-2 rounded-(--radius) border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-sm font-medium hover:bg-[hsl(var(--muted))]"
      >
        <Mail size={16} /> Emails autorisés
      </button>

      {isOpen && (
        <EmailsAutorisesDrawer
          onClose={() => {
            setIsOpen(false)
          }}
        />
      )}
    </Can>
  )
}

function EmailsAutorisesDrawer({ onClose }: { onClose: () => void }) {
  const [emailInput, setEmailInput] = useState('')
  const { data: emails, isPending } = useEmailsAutorises()
  const { mutate: ajouter, isPending: isAdding } = useAjouterEmailAutorise()
  const { mutate: supprimer } = useSupprimerEmailAutorise()

  const emailNormalise = emailInput.trim().toLowerCase()
  const emailValide = EMAIL_REGEX.test(emailNormalise)

  const handleAdd = () => {
    if (!emailValide) {
      toast.error('Adresse email invalide.')
      return
    }
    ajouter(emailNormalise, {
      onSuccess: () => {
        setEmailInput('')
      },
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-sm flex-col bg-[hsl(var(--card))] shadow-lg"
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <div className="flex items-center justify-between border-b border-[hsl(var(--border))] p-4">
          <h3 className="text-lg font-semibold">Emails autorisés</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="border-b border-[hsl(var(--border))] p-4">
          <p className="mb-2 text-xs text-[hsl(var(--muted-foreground))]">
            Seuls les emails listés ci-dessous peuvent envoyer des fichiers de ventes par mail. Les
            autres sont ignorés automatiquement.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="email"
              placeholder="nouvel-email@exemple.com"
              value={emailInput}
              onChange={(e) => {
                setEmailInput(e.target.value)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd()
              }}
              disabled={isAdding}
              className="flex-1 rounded-(--radius) border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:ring-2 focus:ring-[hsl(var(--ring))] focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAdd}
              disabled={isAdding || !emailValide}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-(--radius) bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] transition-opacity hover:opacity-90 disabled:opacity-50"
              aria-label="Ajouter l'email"
            >
              {isAdding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isPending ? (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Chargement...</p>
          ) : emails && emails.length > 0 ? (
            <ul className="space-y-2">
              {emails.map((e) => (
                <li
                  key={e.id}
                  className="flex items-center justify-between gap-2 rounded-(--radius) border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm"
                >
                  <span className="truncate">{e.email}</span>
                  <button
                    type="button"
                    onClick={() => {
                      supprimer(e.id)
                    }}
                    className="shrink-0 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))]"
                    aria-label={`Supprimer ${e.email}`}
                  >
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Aucun email autorisé pour le moment.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
