import { useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { ArrowLeft, Edit2, Save, X, Loader2 } from 'lucide-react'
import { useAgence, useUpdateAgence } from '../hooks'
import { AgenceStatusBadge } from '../components/AgenceStatusBadge'
import { AgenceForm } from '../components/AgenceForm'
import { PageHeader } from '@/shared/components/layout/PageHeader'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { formatDateTime } from '@/shared/utils'
import type { UpdateAgencePayload } from '../types'

export function AgenceDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)

  const { data: agence, isLoading, isError, refetch } = useAgence(id)
  const { mutate: update, isPending: isUpdating } = useUpdateAgence()

  if (isLoading) {
    return <div className="p-6">Chargement...</div>
  }

  if (isError || !agence) {
    return <ErrorState title="Agence introuvable" onRetry={() => void refetch()} />
  }

  const handleSubmit = (data: UpdateAgencePayload) => {
    update(
      { id, payload: data },
      {
        onSuccess: () => { setIsEditing(false); },
      },
    )
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

      <PageHeader
        title={agence.nom}
        description={`Code: ${agence.code}`}
        actions={
          <div className="flex items-center gap-3">
            <AgenceStatusBadge actif={agence.actif} />
            {!isEditing && (
              <button
                type="button"
                onClick={() => { setIsEditing(true); }}
                className="flex items-center gap-2 rounded-[var(--radius)] bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] transition-opacity hover:opacity-90"
              >
                <Edit2 size={16} />
                Modifier
              </button>
            )}
          </div>
        }
      />

      {!isEditing ? (
        <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            {[
              { label: 'Nom', value: agence.nom },
              { label: 'Code', value: agence.code },
              { label: 'Adresse', value: agence.adresse || 'Non renseignée' },
              { label: 'Téléphone', value: agence.telephone || 'Non renseigné' },
              { label: 'Email', value: agence.email || 'Non renseigné' },
              { label: 'Créée le', value: formatDateTime(agence.createdAt) },
              { label: 'Modifiée le', value: formatDateTime(agence.updatedAt) },
              { label: "Nombre d'utilisateurs", value: agence._count?.users ?? 0 },
            ].map(({ label, value }) => (
              <div key={label}>
                <dt className="mb-0.5 text-xs font-medium tracking-wider text-[hsl(var(--muted-foreground))] uppercase">
                  {label}
                </dt>
                <dd className="text-[hsl(var(--foreground))]">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : (
        <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
          <h2 className="mb-4 text-base font-medium">Modification de l'agence</h2>
          <AgenceForm
            defaultValues={{
              nom: agence.nom,
              code: agence.code,
              adresse: agence.adresse ?? '',
              telephone: agence.telephone ?? '',
              email: agence.email ?? '',
              actif: agence.actif,
            }}
            onSubmit={handleSubmit}
            isSubmitting={isUpdating}
            submitLabel="Enregistrer"
          >
            <button
              type="button"
              onClick={() => { setIsEditing(false); }}
              disabled={isUpdating}
              className="rounded-[var(--radius)] border border-[hsl(var(--border))] px-4 py-2 text-sm font-medium transition-colors hover:bg-[hsl(var(--muted))] disabled:opacity-50"
            >
              <X size={16} className="inline" /> Annuler
            </button>
          </AgenceForm>
        </div>
      )}
    </div>
  )
}
