export type TypeLigneBrouillard = 'A' | 'B'

export interface LigneBrouillard {
  numeroPiece: string
  libelle: string
  date: string
  recettes: number
  depenses: number
  solde: number
  type: TypeLigneBrouillard
}

export interface BrouillardResult {
  agenceId: string | null
  agenceNom: string
  numeroRegistre: string
  dateDebut: string | null
  dateFin: string | null
  lignes: LigneBrouillard[]
  totalRecettes: number
  totalDepenses: number
  soldeFinal: number
}

export interface BrouillardQueryParams {
  agenceId?: string | undefined
  dateDebut?: string | undefined
  dateFin?: string | undefined
}
