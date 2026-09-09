export type StatutAnomalieBrouillard =
  | "OK"
  | "MOINS_VERSE"
  | "MOINS_VERSE_RETARD"
  | "RETARD"
  | "NON_VERSE"
  | "TROP_VERSE"
  | "ANOMALIE";

export type StatutBrouillard = "OUVERT" | "CLOTURE" | "VALIDE" | "REJETE";

export interface BrouillardQueryParams {
  page: number;
  limit: number;
  agenceId?: string;
  numeroTS10?: string;
  dateDebut?: string;
  dateFin?: string;
  statutAnomalie?: StatutAnomalieBrouillard;
  statut?: StatutBrouillard;
  sortBy?: "journee" | "ecart" | "penalite";
  sortOrder?: "asc" | "desc";
}

export interface ClotureBrouillardInput {
  situation?: string;
}

export interface RejeterBrouillardInput {
  raison: string;
}
