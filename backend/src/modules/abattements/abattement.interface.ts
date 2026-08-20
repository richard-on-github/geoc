export interface AbattementQueryParams {
  page: number;
  limit: number;
  search?: string;
  agenceId?: string;
  dateDebut?: string;
  dateFin?: string;
  jour?: number;
  mois?: number;
  annee?: number;
  /** Filtre sur le statut calculé (RETARD, MOINS_VERSE, ...). */
  statut?: string;
  sortBy?: "dateDebut" | "totalVente" | "jourAnnee";
  sortOrder?: "asc" | "desc";
}

export interface VersementInput {
  venteId: string;
  montantVerse: number;
  /** ISO 8601, ex: "2026-08-04T14:32:00.000Z" */
  dateVersement: string;
}

export interface AbattementParametresInput {
  heureLimiteUTC?: number;
  tauxRetard?: number;
  tauxMoinsVerse?: number;
  tauxMoinsVerseAvecRetard?: number;
  tauxNonVerse?: number;
}
