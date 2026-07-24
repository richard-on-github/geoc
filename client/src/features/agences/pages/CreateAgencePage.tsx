import { useNavigate } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { AgenceForm } from '../components/AgenceForm'
import { useCreateAgence } from '../hooks'
import type { CreateAgencePayload } from '../types'

export function CreateAgencePage() {
  const navigate = useNavigate()
  const { mutate: create, isPending } = useCreateAgence()

  const onSubmit = (data: CreateAgencePayload) => {
    create(data, {
      onSuccess: () => navigate('/agences'),
    })
  }

  return (
    <div className="container mx-auto max-w-3xl py-6">
      <button
        type="button"
        onClick={() => navigate('/agences')}
        className="mb-4 flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
      >
        <ArrowLeft size={15} aria-hidden="true" />
        Retour à la liste
      </button>
      <h1 className="mb-6 text-2xl font-semibold">Créer une agence</h1>
      <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
        <AgenceForm onSubmit={onSubmit} isSubmitting={isPending} submitLabel="Créer" />
      </div>
    </div>
  )
}
