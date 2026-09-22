import { axiosInstance } from '@/shared/api'
import type { ApiPaginatedResponse } from '@/shared/types'
import type {
  AnnulerClotureResult,
  Vente,
  VenteQueryParams,
  VenteCloture,
  StatutEncaissement,
  EncaissementInput,
  EncaissementResult,
  HistoriqueEncaissement,
} from '../types'

const BASE_URL = '/ventes'

type VenteApiRaw = {
  id?: unknown
  agenceId?: unknown
  agenceNom?: unknown
  kiosque?: unknown
  agent?: unknown
  banque?: unknown
  numeroTS10?: unknown
  totalVente?: unknown
  totalPaye?: unknown
  totalSolde?: unknown
  dateDebut?: unknown
  dateFin?: unknown
  importId?: unknown
  clotureId?: unknown
  jourAnnee?: unknown
  mois?: unknown
  annee?: unknown
  statutEncaissement?: unknown
  montantEncaisse?: unknown
  createdAt?: unknown
  updatedAt?: unknown
  agence?: unknown
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function asNumber(value: unknown): number {
  return typeof value === 'number' ? value : Number(value)
}

const STATUTS_ENCAISSEMENT: readonly StatutEncaissement[] = [
  'NON_SOLDE',
  'PARTIELLEMENT_SOLDE',
  'SOLDE',
]

function asStatutEncaissement(value: unknown): StatutEncaissement {
  return typeof value === 'string' && (STATUTS_ENCAISSEMENT as readonly string[]).includes(value)
    ? (value as StatutEncaissement)
    : 'NON_SOLDE'
}

function mapVente(raw: VenteApiRaw): Vente {
  const vente: Vente = {
    id: raw.id as Vente['id'],
    agenceId: raw.agenceId as Vente['agenceId'],
    agenceNom: asString(raw.agenceNom),
    kiosque: asString(raw.kiosque),
    agent: asString(raw.agent),
    banque: asString(raw.banque),
    numeroTS10: asString(raw.numeroTS10),
    totalVente: asNumber(raw.totalVente),
    totalPaye: asNumber(raw.totalPaye),
    totalSolde: asNumber(raw.totalSolde),
    dateDebut: asString(raw.dateDebut),
    dateFin: asString(raw.dateFin),
    importId: raw.importId as Vente['importId'],
    jourAnnee: asNumber(raw.jourAnnee),
    mois: asNumber(raw.mois),
    annee: asNumber(raw.annee),
    statutEncaissement: asStatutEncaissement(raw.statutEncaissement),
    montantEncaisse: asNumber(raw.montantEncaisse),
    createdAt: asString(raw.createdAt),
    updatedAt: asString(raw.updatedAt),
  }

  if (raw.agence !== undefined) {
    vente.agence = raw.agence as NonNullable<Vente['agence']>
  }

  if (raw.clotureId !== undefined) {
    vente.clotureId = raw.clotureId === null ? null : asString(raw.clotureId)
  }

  return vente
}

export const ventesApi = {
  async getVentes(params: VenteQueryParams): Promise<ApiPaginatedResponse<Vente>['data']> {
    const response = await axiosInstance.get<{
      success: boolean
      message: string
      data: {
        ventes: VenteApiRaw[]
        pagination: {
          total: number
          page: number
          limit: number
          totalPages: number
        }
      }
    }>(BASE_URL, { params })

    const { ventes, pagination } = response.data.data

    return {
      items: ventes.map(mapVente),
      total: pagination.total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: pagination.totalPages,
    }
  },

  async importVentes(file: File, periode: string): Promise<void> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('periode', periode)
    await axiosInstance.post(`${BASE_URL}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  async getClotures(): Promise<VenteCloture[]> {
    const response = await axiosInstance.get<{ success: boolean; data: VenteCloture[] }>(
      `${BASE_URL}/clotures`,
    )
    return response.data.data
  },

  async cloturerMois(periode: string): Promise<VenteCloture> {
    const response = await axiosInstance.post<{ success: boolean; data: VenteCloture }>(
      `${BASE_URL}/cloturer`,
      { periode },
    )
    return response.data.data
  },

  /** Annule la clôture d'un mois (uniquement si le mois suivant n'a pas encore de ventes). */
  async annulerCloture(periode: string): Promise<AnnulerClotureResult> {
    const response = await axiosInstance.delete<{ success: boolean; data: AnnulerClotureResult }>(
      `${BASE_URL}/clotures/${periode}`,
    )
    return response.data.data
  },

  async exportVentes(
    params: VenteQueryParams,
    format: 'csv' | 'excel' | 'pdf',
  ): Promise<string | null> {
    const queryString = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params)
          .filter(([_, v]) => v !== undefined && v !== '' && v !== false) // Ignore les false
          .map(([k, v]) => [k, String(v)]),
      ),
    ).toString()

    const url = `${BASE_URL}/export/${format}?${queryString}`

    const response = await axiosInstance.get(url, {
      responseType: 'blob',
    })

    const contentTypeHeader = response.headers['content-type']
    const contentType = typeof contentTypeHeader === 'string' ? contentTypeHeader : ''

    const isUnexpectedResponse =
      contentType.includes('text/html') || contentType.includes('application/json')

    if (isUnexpectedResponse) {
      throw new Error("Erreur lors de l'export : réponse inattendue.")
    }

    const rawExportPassword = response.headers['x-export-password'] as unknown

    const exportPassword =
      typeof rawExportPassword === 'string' && rawExportPassword !== '' ? rawExportPassword : null

    const blob = new Blob([response.data], { type: 'application/zip' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `export_ventes_${String(Date.now())}.zip`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)

    return exportPassword
  },

  async enregistrerEncaissement(input: EncaissementInput): Promise<EncaissementResult> {
    const response = await axiosInstance.post<{ success: boolean; data: EncaissementResult }>(
      `${BASE_URL}/encaissements`,
      input,
    )
    return response.data.data
  },

  async getHistoriqueEncaissements(venteId: string): Promise<HistoriqueEncaissement> {
    const response = await axiosInstance.get<{ success: boolean; data: HistoriqueEncaissement }>(
      `${BASE_URL}/${venteId}/encaissements`,
    )
    return response.data.data
  },

  /**
   * Contrairement aux exports, le reçu est un PDF simple non chiffré
   * (destiné à être imprimé/remis en main propre) : pas de zip, pas de mot
   * de passe. Ouvert directement dans un nouvel onglet.
   */
  async telechargerRecu(encaissementId: string): Promise<void> {
    const response = await axiosInstance.get(`${BASE_URL}/encaissements/${encaissementId}/recu`, {
      responseType: 'blob',
    })

    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    // Laisse le temps au navigateur d'ouvrir l'onglet avant de libérer l'URL.
    setTimeout(() => {
      URL.revokeObjectURL(url)
    }, 10000)
  },
}
