export interface VenteQueryParams {
  page: number;
  limit: number;
  search?: string;
  agenceId?: string;
  dateDebut?: string;
  dateFin?: string;
  sortBy?: "dateDebut" | "totalVente" | "createdAt";
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
