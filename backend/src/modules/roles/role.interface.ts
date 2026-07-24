export type RoleScope = "GLOBAL" | "AGENCE";

export interface CreateRoleInput {
  nom: string;
  code: string;
  description?: string;
  dataScope: RoleScope;
  niveau: number;
  permissionIds?: string[];
}

export interface UpdateRoleInput {
  nom?: string;
  code?: string;
  description?: string;
  dataScope?: RoleScope;
  niveau?: number;
  actif?: boolean;
  permissionIds?: string[];
}

export interface RoleQueryParams {
  page: number;
  limit: number;
  search?: string;
  actif?: boolean;
  dataScope?: RoleScope;
}

export interface RoleAllQueryParams {
  search?: string;
  actif?: boolean;
  dataScope?: RoleScope;
}