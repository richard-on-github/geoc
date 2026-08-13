import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { emailsAutorisesApi } from '../api/emailsAutorises.api'
import { ApiError } from '@/shared/types'

export const EMAIL_AUTORISE_QUERY_KEYS = {
  all: ['emails-autorises'] as const,
  list: () => [...EMAIL_AUTORISE_QUERY_KEYS.all, 'list'] as const,
}

export function useEmailsAutorises() {
  return useQuery({
    queryKey: EMAIL_AUTORISE_QUERY_KEYS.list(),
    queryFn: () => emailsAutorisesApi.getEmailsAutorises(),
  })
}

export function useAjouterEmailAutorise() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (email: string) => emailsAutorisesApi.ajouterEmailAutorise(email),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: EMAIL_AUTORISE_QUERY_KEYS.list() })
      toast.success('Adresse email ajoutée à la liste autorisée.')
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : "Erreur lors de l'ajout de l'adresse.",
      )
    },
  })
}

export function useSupprimerEmailAutorise() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => emailsAutorisesApi.supprimerEmailAutorise(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: EMAIL_AUTORISE_QUERY_KEYS.list() })
      toast.success('Adresse email supprimée de la liste autorisée.')
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Erreur lors de la suppression.')
    },
  })
}
