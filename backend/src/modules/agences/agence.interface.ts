export interface AgenceQueryParams {
  page: number;
  limit: number;
  search?: string;
  actif?: boolean;
  sortBy?: "nom" | "code" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

export interface CreateAgenceInput {
  nom: string;
  code: string;
  adresse?: string;
  telephone?: string;
  email?: string;
}

export interface UpdateAgenceInput {
  nom?: string;
  code?: string;
  adresse?: string;
  telephone?: string;
  email?: string;
}

export interface AgenceAllQueryParams {
  search?: string;
  actif?: boolean;
}

export interface UpdateAgenceStatusInput {
  actif: boolean;
}
