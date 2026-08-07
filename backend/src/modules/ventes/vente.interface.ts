export interface VenteQueryParams {
  page: number;
  limit: number;
  search?: string;
  agenceId?: string;
  agenceNom?: string;
  dateDebut?: string;
  dateFin?: string;
  clotureId?: string;
  nonClotureesOnly?: boolean;
  /** Jour de l'année (1-366), calculé à partir de dateDebut. Indépendant de dateDebut/dateFin. */
  jour?: number;
  /** Mois (1-12), calculé à partir de dateDebut. */
  mois?: number;
  /** Année civile, calculée à partir de dateDebut. */
  annee?: number;
  sortBy?: "agenceNom" | "dateDebut" | "totalVente" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface ParsedVenteRow {
  agenceNomBrut: string;
  kiosque: string;
  agent: string;
  banque?: string;
  numeroTS10: string;
  totalVente: number;
  totalPaye: number;
  totalSolde: number;
  dateDebut: Date;
  dateFin: Date;
}

/** Corps de la requête d'import : précise explicitement pour quelle période (mois) le fichier est chargé. */
export interface ImportVenteBody {
  periode: string; // format YYYY-MM
}
